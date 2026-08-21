import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  CONTENT_ROUTES,
  blockGoogleMaps,
  contrastRatio,
  waitForHydration,
} from './support/helpers';

/**
 * One axe pass per page template. Deliberately not per component — the unit
 * suite covers component structure, whereas this catches whole-page problems
 * that only exist once real CSS is applied: contrast against the fixed
 * background photo, landmark structure, and duplicated ids after hydration.
 *
 * The tag list includes `best-practice` as well as WCAG — see
 * docs/development.md#browser-regression-suite.
 */
test.describe('accessibility', () => {
  for (const { path } of CONTENT_ROUTES) {
    test(`${path} has no detectable axe violations`, async ({ page }) => {
      await blockGoogleMaps(page);
      await page.goto(path);

      await waitForHydration(page);

      const { violations } = await new AxeBuilder({ page })
        .withTags(['best-practice', 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // Third-party frames are excluded because their markup is not ours to
        // fix. The experience page embeds a YouTube player whose own DOM trips
        // aria-allowed-attr, aria-prohibited-attr and button-name; including it
        // would make this check permanently red and therefore ignored.
        .exclude('iframe')
        .analyze();

      expect(
        violations.map(({ id, nodes }) => `${id} (${nodes.length})`)
      ).toEqual([]);
    });
  }
});

/**
 * Contrast for icons axe cannot see: its `color-contrast` rule only
 * evaluates text nodes, so an SVG painted with `stroke="currentColor"` passes
 * regardless of how badly it fails — see docs/decisions.md#d-260821a, where
 * exactly that let a 1.72:1 icon through for weeks.
 *
 * Scoped to icons rendered on a background colour distinct from the page's
 * own — a Mantine `filled`/coloured-circle treatment with no adjacent text
 * sharing that exact pairing. An icon that only ever sits next to text of its
 * own colour (the outline buttons on `/portfolio` and the 404/500 pages, the
 * footer's social links) is already provable from that text's own axe
 * result, so it is not repeated here. Icons rendered onto the live Google
 * Map are excluded for the opposite reason: the map tiles are real imagery
 * with no fixed colour to assert against.
 *
 * WCAG 1.4.11 sets 3:1, not 4.5:1, for non-text UI components.
 */
const NON_TEXT_CONTRAST_MINIMUM = 3;

/**
 * Runs inside the page, so it cannot reference anything from module scope.
 * Walks up from the icon for the first non-transparent background, since the
 * element that paints it is not always the icon's immediate parent.
 */
const readIconContrastColours = (icon: Element) => {
  const foreground = getComputedStyle(icon).color;
  let node: Element | null = icon;

  while (node) {
    const { backgroundColor } = getComputedStyle(node);

    if (
      backgroundColor !== 'rgba(0, 0, 0, 0)' &&
      backgroundColor !== 'transparent'
    ) {
      return { background: backgroundColor, foreground };
    }

    node = node.parentElement;
  }

  throw new Error('No painted background found above this icon');
};

test.describe('icon contrast axe cannot see', () => {
  test('the experience timeline icons clear the circle behind them', async ({
    page,
  }) => {
    await blockGoogleMaps(page);
    await page.goto('/experience');
    await waitForHydration(page);

    for (const iconClass of ['tabler-icon-briefcase', 'tabler-icon-school']) {
      const { background, foreground } = await page
        .locator(`svg.${iconClass}`)
        .evaluate(readIconContrastColours);

      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
        NON_TEXT_CONTRAST_MINIMUM
      );
    }
  });

  test('the scroll-to-top control clears its filled background', async ({
    page,
  }) => {
    await page.goto('/experience');
    await waitForHydration(page);
    await page.mouse.wheel(0, 600);
    await expect(
      page.getByRole('button', { name: 'Scroll to top' })
    ).toBeVisible();

    const { background, foreground } = await page
      .locator('svg.tabler-icon-arrow-move-up')
      .evaluate(readIconContrastColours);

    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
      NON_TEXT_CONTRAST_MINIMUM
    );
  });
});
