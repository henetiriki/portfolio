import { expect, test } from '@playwright/test';
import { pinVisualBackground } from './support/helpers';

test.describe('desktop portfolio grid', () => {
  test.beforeEach(async ({ page }) => {
    await pinVisualBackground(page);
    await page.goto('/portfolio');
  });

  test('matches the approved card layout', async ({ page }) => {
    const grid = page
      .locator('[class*="grid"]')
      .filter({ hasText: 'Beauty WithIn' });

    await expect(
      grid.getByRole('img', { name: 'Reserved for You' })
    ).toBeVisible();

    await expect(grid).toHaveScreenshot('portfolio-grid.png', {
      animations: 'disabled',
    });
  });
});
