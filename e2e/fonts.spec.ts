import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * The two self-hosted font files, and the fallback metrics that go with them.
 *
 * `next/font/local` resolves the files at build time from paths in
 * `src/styles/fonts.ts`, so a moved or renamed `woff2` fails the build rather
 * than shipping. What the build cannot catch is the rest of the chain: the
 * preload tags disappearing, the generated families not being what the page
 * actually renders in, or the size-adjusted fallback faces being dropped —
 * which costs layout stability silently, because the text still renders.
 * See docs/styling-theming.md#fonts.
 */

// One preloaded latin file per family, and nothing else. Asserted exactly so
// that adding a subset — or losing preload altogether — has to be a decision.
const PRELOADED_FILES = 2;

const FONT_PROPERTIES = [
  '--portfolio-font-body',
  '--portfolio-font-heading',
] as const;

/** First family of a stack, without the quoting a computed value may add. */
const firstFamily = (stack: string) =>
  stack.split(',')[0].replaceAll(/['"]/g, '').trim();

/** The generated family name `next/font` writes into a document-level property. */
const readDeclaredFamily = async (page: Page, property: string) => {
  const stack = await page.evaluate(
    name =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    property
  );

  return firstFamily(stack);
};

/** The family an element actually resolves to, after the theme's fallbacks. */
const readRenderedFamily = async (page: Page, selector: string) => {
  const stack = await page
    .locator(selector)
    .first()
    .evaluate(element => getComputedStyle(element).fontFamily);

  return firstFamily(stack);
};

test.describe('self-hosted fonts', () => {
  test('the document preloads both font files from this origin', async ({
    page,
    request,
  }) => {
    await page.goto('/');

    const hrefs = await page
      .locator('link[rel="preload"][as="font"]')
      .evaluateAll(links => links.map(link => link.getAttribute('href') ?? ''));

    expect(hrefs).toHaveLength(PRELOADED_FILES);

    // Status alone is not enough: a rewrite can answer a missing file with the
    // application shell, which is a 200 of the wrong type.
    const results = await Promise.all(
      hrefs.map(async href => {
        const response = await request.get(href);

        return {
          contentType: response.headers()['content-type'] ?? '',
          href,
          status: response.status(),
        };
      })
    );

    expect(
      results.filter(
        ({ contentType, href, status }) =>
          status !== 200 ||
          contentType !== 'font/woff2' ||
          !href.startsWith('/_next/static/media/')
      )
    ).toEqual([]);
  });

  test('the page renders in the families it loads', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const loaded = await page.evaluate(() =>
      [...document.fonts]
        .filter(({ status }) => status === 'loaded')
        .map(({ family }) => family)
    );

    const [bodyFamily, headingFamily] = await Promise.all(
      FONT_PROPERTIES.map(property => readDeclaredFamily(page, property))
    );

    expect(loaded).toEqual(expect.arrayContaining([bodyFamily, headingFamily]));
    expect(await readRenderedFamily(page, 'h1')).toBe(headingFamily);
    expect(await readRenderedFamily(page, 'main p')).toBe(bodyFamily);
  });

  test('each family keeps a size-adjusted fallback face', async ({ page }) => {
    await page.goto('/');

    // Read from the stylesheets rather than from `document.fonts`, because the
    // adjustment descriptors are the whole point and `FontFace` does not
    // expose them in this TypeScript release's DOM library.
    const fallbacks = await page.evaluate(() =>
      [...document.styleSheets]
        .flatMap(sheet => {
          try {
            return [...sheet.cssRules];
          } catch {
            return [];
          }
        })
        .filter(rule => rule instanceof CSSFontFaceRule)
        .map(({ style }) => ({
          ascentOverride: style.getPropertyValue('ascent-override'),
          family: style.getPropertyValue('font-family').replaceAll(/['"]/g, ''),
          sizeAdjust: style.getPropertyValue('size-adjust'),
        }))
        .filter(({ family }) => family.endsWith('Fallback'))
    );

    expect(fallbacks).toHaveLength(FONT_PROPERTIES.length);
    expect(
      fallbacks.filter(
        ({ ascentOverride, sizeAdjust }) => !ascentOverride || !sizeAdjust
      )
    ).toEqual([]);
  });
});
