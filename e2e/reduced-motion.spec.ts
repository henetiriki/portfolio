import { expect, test } from '@playwright/test';
import {
  blockGoogleMaps,
  captureScrollIntoView,
  waitForHydration,
} from './support/helpers';

/**
 * jsdom has no media query support — see
 * docs/development.md#browser-regression-suite.
 */
test.describe('reduced motion', () => {
  test('scroll-to-top jumps instantly instead of scrolling smoothly', async ({
    page,
  }) => {
    const behaviours = await captureScrollIntoView(page);

    await blockGoogleMaps(page);

    await page.goto('/experience');
    await waitForHydration(page);

    await page.mouse.wheel(0, 800);
    await page.getByRole('button', { name: 'Scroll to top' }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    expect(behaviours).toEqual(['auto']);
  });
});
