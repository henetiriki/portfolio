import { expect, test } from '@playwright/test';
import { CONTENT_ROUTES } from './support/helpers';
import type { APIRequestContext } from '@playwright/test';

/**
 * The policy enforces, and its whole value depends on the header actually
 * arriving intact — a mode this suite exists to pin down because both of its
 * failure modes are silent.
 *
 * `headers.source` in next.config.js carries a route parameter, which puts
 * every value through Next's path-to-regexp compilation. A value that trips
 * that step is dropped from the response with no build warning, and escaping
 * the colons to avoid it instead ships literal backslashes that no browser can
 * parse. Either way the page looks perfectly healthy. See
 * docs/decisions.md#d-260814c.
 *
 * Enforcing raises the stakes of exactly that failure: a dropped header used to
 * mean losing observation, and now means losing the policy itself while every
 * page still renders. See docs/decisions.md#d-260815h.
 */
test.describe('content security policy', () => {
  const headersFor = async (request: APIRequestContext, path = '/') =>
    (await request.get(path)).headers();

  const policyFor = async (request: APIRequestContext) =>
    (await headersFor(request))['content-security-policy'];

  for (const { path } of CONTENT_ROUTES) {
    test(`${path} is served the enforcing policy`, async ({ request }) => {
      const headers = await headersFor(request, path);

      expect(headers['content-security-policy']).toBeTruthy();
      // Both headers together would apply independently, silently doubling
      // the enforced policy with a redundant Report-Only copy.
      expect(headers['content-security-policy-report-only']).toBeUndefined();
    });
  }

  test('every origin in the policy survives unescaped', async ({ request }) => {
    const policy = await policyFor(request);

    expect(policy).toContain('https://maps.googleapis.com');
    // Derived from IMAGE_HOST_PROTOCOL/IMAGE_HOST_NAME, which CI sets to the
    // real Cloudinary host. Change those and this is the assertion to update.
    expect(policy).toContain('https://res.cloudinary.com');
    expect(policy).not.toContain('\\');
  });

  test('the policy keeps what the map needs to render', async ({ request }) => {
    const policy = await policyFor(request);

    // Both were observed violations before they were allowlist entries, and
    // enforcing makes losing either a broken map rather than a report.
    expect(policy).toContain("'wasm-unsafe-eval'");
    expect(policy).toContain('https://mapsresources-pa.googleapis.com');
  });

  test('the policy permits inline styles but not inline scripts', async ({
    request,
  }) => {
    const policy = await policyFor(request);

    expect(policy).toMatch(/script-src [^;]*'wasm-unsafe-eval'/);
    expect(policy).not.toMatch(/script-src [^;]*'unsafe-inline'/);
    expect(policy).toMatch(/style-src [^;]*'unsafe-inline'/);
  });

  test('the policy keeps the directives that do not depend on inline', async ({
    request,
  }) => {
    const policy = await policyFor(request);

    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });
});

test.describe('permissions policy', () => {
  for (const { path } of CONTENT_ROUTES) {
    test(`${path} disables unused capabilities`, async ({ request }) => {
      const headers = (await request.get(path)).headers();
      const policy = headers['permissions-policy'];

      expect(policy).toBeTruthy();
      // Empty allowlists, not `self` — nothing on the site, this origin
      // included, is a candidate to ever need these.
      expect(policy).toContain('camera=()');
      expect(policy).toContain('geolocation=()');
      expect(policy).toContain('microphone=()');
      expect(policy).toContain('payment=()');
      expect(policy).toContain('usb=()');
    });
  }
});
