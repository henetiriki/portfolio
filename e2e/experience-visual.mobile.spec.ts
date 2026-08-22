import { expect, test } from '@playwright/test';
import { blockGoogleMaps, pinVisualBackground } from './support/helpers';

test.describe('mobile experience timeline', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
    await pinVisualBackground(page);
    await page.goto('/experience');
  });

  test(
    'matches the approved initial work-history viewport',
    { tag: '@visual' },
    async ({ page }) => {
      const workHistory = page.getByRole('heading', { name: 'Work History' });

      await expect(page.locator('img[src*="BZ4QGdOn6SP"]')).toBeVisible();
      await workHistory.evaluate(element =>
        window.scrollBy({ top: element.getBoundingClientRect().top - 96 })
      );

      await expect(page).toHaveScreenshot('experience-work-history.png', {
        animations: 'disabled',
      });
    }
  );
});
