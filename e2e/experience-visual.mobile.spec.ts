import { expect, test } from '@playwright/test';
import { blockGoogleMaps, pinVisualBackground } from './support/helpers';

test.describe('mobile experience timeline', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
    await pinVisualBackground(page);
    await page.goto('/experience');
  });

  test('matches the approved initial work-history viewport', async ({
    page,
  }) => {
    await expect(page.locator('img[src*="BZ4QGdOn6SP"]')).toBeVisible();

    await expect(page).toHaveScreenshot('experience-work-history.png', {
      animations: 'disabled',
    });
  });
});
