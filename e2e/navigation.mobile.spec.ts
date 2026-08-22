import { expect, test } from '@playwright/test';
import { blockGoogleMaps } from './support/helpers';

/**
 * Mobile-only: `playwright.config.ts` routes `*.mobile.spec.ts` to the mobile
 * project, so this never runs against a desktop viewport and never reports a
 * skip. `Navigation.module.css` hides `.burger` and `.drawer` above the `sm`
 * breakpoint, so there would be nothing here to exercise.
 *
 * The mobile drawer is the single most regression-prone part of this UI — it
 * needed repeated fixes across the Mantine v6 -> v7 -> v9 migrations (grey
 * bar behind the close control, an invisible close icon, background content
 * no longer being aria-hidden). Those were all found by hand. This is the
 * cheapest place to stop that recurring.
 */
test.describe('mobile drawer', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
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

  test('matches the approved open drawer', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();

    await expect(page.getByRole('dialog')).toHaveScreenshot('open-drawer.png', {
      animations: 'disabled',
    });
  });

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
