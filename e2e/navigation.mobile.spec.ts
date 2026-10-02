import { expect, test } from '@playwright/test';
import { blockGoogleMaps, pinVisualBackground } from './support/helpers';

/**
 * Mobile-only — see docs/development.md#browser-regression-suite. This UI's
 * most regression-prone part across Mantine's v6->v7->v9 migrations.
 */
test.describe('mobile drawer', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
    await pinVisualBackground(page);
    await page.goto('/');
  });

  test('opens, lists every route, and closes again', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();

    const drawer = page.getByRole('dialog');

    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link')).toHaveCount(5);

    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(drawer).toBeHidden();
  });

  test(
    'matches the approved open drawer',
    { tag: '@visual' },
    async ({ page }) => {
      await page.getByRole('button', { name: 'Open menu' }).click();

      await expect(page.getByRole('dialog')).toHaveScreenshot(
        'open-drawer.png',
        {
          animations: 'disabled',
        }
      );
    }
  );

  test('navigates and closes itself when a link is chosen', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'Travel' })
      .click();

    await expect(page).toHaveURL(/\/travel$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('is operable by keyboard and closes on Escape', async ({ page }) => {
    const burger = page.getByRole('button', { name: 'Open menu' });

    await burger.focus();
    await page.keyboard.press('Enter');

    const drawer = page.getByRole('dialog');

    await expect(drawer).toBeVisible();

    // Focus must move into the drawer, otherwise a keyboard user is stranded
    // behind an open overlay — something jsdom cannot meaningfully assert.
    await expect(drawer).toContainText('Travel');
    await expect(page.locator(':focus')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });
});
