import { expect, test } from '@playwright/test';
import { pinVisualBackground } from './support/helpers';

test.describe('desktop portfolio grid', () => {
  test.beforeEach(async ({ page }) => {
    await pinVisualBackground(page);
    await page.goto('/portfolio');
  });

  test(
    'matches the approved card layout',
    { tag: '@visual' },
    async ({ page }) => {
      const grid = page
        .locator('[class*="grid"]')
        .filter({ hasText: 'Beauty WithIn' });

      await expect(
        grid.getByRole('img', {
          name: 'Placeholder graphic for an upcoming portfolio project — reserved website slot',
        })
      ).toBeVisible();

      await expect(grid).toHaveScreenshot('portfolio-grid.png', {
        animations: 'disabled',
      });
    }
  );
});
