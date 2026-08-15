import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

/**
 * Installability, not the offline experience.
 *
 * The service worker is deliberately out of scope: this suite blocks it (see
 * `playwright.config.ts`) and CI already asserts that a production build emits
 * one. What nothing guarded until now is the manifest and the assets it and
 * the document reference — a renamed or moved icon breaks installability
 * silently, because the build still succeeds and no test fails.
 * See docs/development.md#browser-regression-suite.
 */

// Every icon and splash-screen link in `_document.tsx`: three PNG favicons,
// `favicon.ico`, one apple-touch-icon and 42 apple-touch-startup-images.
// Asserted exactly, so that removing the tags wholesale fails here rather than
// making the "every asset is served" check pass vacuously.
const DOCUMENT_ASSET_LINKS = 47;

const ICON_LINK_SELECTOR =
  'link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-startup-image"]';

interface ManifestIcon {
  purpose?: string;
  sizes: string;
  src: string;
}

interface Manifest {
  icons: ManifestIcon[];
  shortcuts?: { url: string }[];
}

/**
 * Fetch every path and return only those not served as an image.
 *
 * Reports all failures rather than throwing on the first, because the usual
 * cause — a renamed or moved directory — breaks many assets at once, and the
 * useful failure message is the whole list.
 *
 * The content type is checked as well as the status because a rewrite can
 * answer a missing file with the application shell, which is a 200.
 */
const findBrokenImages = async (
  request: APIRequestContext,
  paths: string[]
) => {
  const results = await Promise.all(
    paths.map(async path => {
      const response = await request.head(path);
      const contentType = response.headers()['content-type'] ?? '';

      return { contentType, path, status: response.status() };
    })
  );

  return results.filter(
    ({ contentType, status }) =>
      status !== 200 || !contentType.startsWith('image/')
  );
};

const readManifest = async (request: APIRequestContext) => {
  const response = await request.get('/manifest.json');

  expect(response.status()).toBe(200);

  return (await response.json()) as Manifest;
};

/** An icon's `purpose` is a space-separated list, and defaults to `any`. */
const servesPurposeAny = ({ purpose }: ManifestIcon) =>
  (purpose ?? 'any').split(' ').includes('any');

test.describe('PWA installability', () => {
  test('the document links a manifest that declares an installable app', async ({
    page,
    request,
  }) => {
    await page.goto('/');

    const manifestLink = page.locator('link[rel="manifest"]');

    await expect(manifestLink).toHaveCount(1);
    expect(await manifestLink.getAttribute('href')).toBe('/manifest.json');

    const manifest = await readManifest(request);

    expect(manifest).toMatchObject({
      // `standalone` is what makes an installed launch drop the browser UI.
      background_color: expect.stringMatching(/^#[0-9a-f]{3,8}$/i),
      display: 'standalone',
      name: expect.stringMatching(/\S/),
      short_name: expect.stringMatching(/\S/),
      start_url: '/',
      theme_color: expect.stringMatching(/^#[0-9a-f]{3,8}$/i),
    });
  });

  test('the manifest declares the icon sizes an install prompt requires', async ({
    request,
  }) => {
    const manifest = await readManifest(request);

    // Chrome offers to install only when `purpose: any` covers both a 192px
    // and a 512px icon. The 512px entries are also listed as `maskable`, so
    // filtering on purpose is what makes this assertion meaningful.
    const sizes = manifest.icons
      .filter(servesPurposeAny)
      .map(({ sizes: declared }) => Number.parseInt(declared, 10));

    expect(sizes.some(size => size >= 192)).toBe(true);
    expect(sizes.some(size => size >= 512)).toBe(true);
  });

  test('every asset the manifest references is served', async ({ request }) => {
    const manifest = await readManifest(request);

    const broken = await findBrokenImages(
      request,
      manifest.icons.map(({ src }) => src)
    );

    expect(broken).toEqual([]);
  });

  test('every shortcut the manifest offers resolves to a real route', async ({
    request,
  }) => {
    const manifest = await readManifest(request);
    const shortcuts = manifest.shortcuts ?? [];

    expect(shortcuts.length).toBeGreaterThan(0);

    const statuses = await Promise.all(
      shortcuts.map(async ({ url }) => {
        const response = await request.get(url);

        return { status: response.status(), url };
      })
    );

    expect(statuses.filter(({ status }) => status !== 200)).toEqual([]);
  });

  test('every icon and splash-screen link in the document is served', async ({
    page,
    request,
  }) => {
    await page.goto('/');

    const hrefs = await page
      .locator(ICON_LINK_SELECTOR)
      .evaluateAll(links => links.map(link => link.getAttribute('href') ?? ''));

    expect(hrefs).toHaveLength(DOCUMENT_ASSET_LINKS);
    expect(await findBrokenImages(request, hrefs)).toEqual([]);
  });
});
