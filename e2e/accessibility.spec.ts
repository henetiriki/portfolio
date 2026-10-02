import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  CONTENT_ROUTES,
  blockGoogleMaps,
  contrastRatio,
  waitForHydration,
} from './support/helpers';

/**
 * One axe pass per page template, not per component — see
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
 * Contrast for icons axe cannot see (WCAG 1.4.11's 3:1 floor) — see
 * docs/development.md#browser-regression-suite.
 */
const NON_TEXT_CONTRAST_MINIMUM = 3;

/**
 * Runs inside the page, so it cannot reference module scope. Walks up for the
 * first painted background, since the icon's immediate parent isn't always it.
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

  test('the scroll-to-top control clears its hovered background too', async ({
    page,
  }) => {
    // Navigation.module.css swaps the background on :hover through a plain
    // CSS rule Mantine's own colour computation never sees, so the resting
    // state above proves nothing about this one. Real pointer input is
    // required — a dispatched event does not make an element match :hover.
    await page.goto('/experience');
    await waitForHydration(page);
    await page.mouse.wheel(0, 600);

    const control = page.getByRole('button', { name: 'Scroll to top' });

    await expect(control).toBeVisible();
    await control.hover();

    const { background, foreground } = await page
      .locator('svg.tabler-icon-arrow-move-up')
      .evaluate(readIconContrastColours);

    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
      NON_TEXT_CONTRAST_MINIMUM
    );
  });
});
