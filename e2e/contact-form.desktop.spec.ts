import { expect, test } from '@playwright/test';
import { pinVisualBackground } from './support/helpers';

test.describe('desktop contact validation', () => {
  test.beforeEach(async ({ page }) => {
    await pinVisualBackground(page);
    await page.goto('/contact');
  });

  test(
    'matches the approved invalid-form state',
    { tag: '@visual' },
    async ({ page }) => {
      const form = page.locator('form');

      await expect(page.locator('img[src*="BZ4QGdOn6SP"]')).toBeVisible();
      await form.getByRole('button', { name: 'Send' }).click();

      await expect(page.getByText('Please enter your name')).toBeVisible();
      await expect(page.getByText('Please enter a valid email')).toBeVisible();
      await expect(page.getByText('Please enter your message')).toBeVisible();

      await form.evaluate(element =>
        window.scrollBy({ top: element.getBoundingClientRect().top - 96 })
      );

      await expect(form).toHaveScreenshot('invalid-contact-form.png', {
        animations: 'disabled',
      });
    }
  );
});
