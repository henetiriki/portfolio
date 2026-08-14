import { expect, test } from '@playwright/test';
import { CONTENT_ROUTES } from './support/helpers';
import type { APIRequestContext } from '@playwright/test';

/**
 * The policy ships Report-Only, and its whole value depends on the header
 * actually arriving intact — a mode this suite exists to pin down because both
 * of its failure modes are silent.
 *
 * `headers.source` in next.config.js carries a route parameter, which puts
 * every value through Next's path-to-regexp compilation. A value that trips
 * that step is dropped from the response with no build warning, and escaping
 * the colons to avoid it instead ships literal backslashes that no browser can
 * parse. Either way the page looks perfectly healthy. See
 * docs/decisions.md#d012.
 */
test.describe('content security policy', () => {
  const headersFor = async (request: APIRequestContext, path = '/') =>
    (await request.get(path)).headers();

  const policyFor = async (request: APIRequestContext) =>
    (await headersFor(request))['content-security-policy-report-only'];

  for (const { path } of CONTENT_ROUTES) {
    test(`${path} is served the Report-Only policy`, async ({ request }) => {
      const headers = await headersFor(request, path);

      expect(headers['content-security-policy-report-only']).toBeTruthy();
      // Promotion to an enforcing header is a deliberate, separate decision.
      expect(headers['content-security-policy']).toBeUndefined();
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

  test('the policy keeps the directives that do not depend on inline', async ({
    request,
  }) => {
    const policy = await policyFor(request);

    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });

  test('the policy points at a report endpoint that accepts reports', async ({
    request,
  }) => {
    expect(await policyFor(request)).toContain('report-uri /api/csp-report');

    const response = await request.post('/api/csp-report', {
      data: {
        'csp-report': {
          'blocked-uri': 'https://blocked.example/x.js',
          'document-uri': '/',
          'effective-directive': 'script-src-elem',
        },
      },
      headers: { 'content-type': 'application/csp-report' },
    });

    expect(response.status()).toBe(204);
  });
});
