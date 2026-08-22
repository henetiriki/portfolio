import { expect, test } from '@playwright/test';
import { CONTENT_ROUTES, blockGoogleMaps } from './support/helpers';

/**
 * Desktop-only counterpart to `navigation.mobile.spec.ts`.
 *
 * `Navigation.module.css` swaps the two navigation modes on the `sm`
 * breakpoint: `.desktopLinks` is hidden below it, `.burger` and `.drawer`
 * above it. Testing only the drawer left the desktop half — the mode most
 * visitors see — with no browser coverage at all.
 *
 * This guards the breakpoint itself. Mantine breakpoints compile through
 * `postcss-simple-vars` at build time, and a mis-converted one has shipped
 * here before (a raw pixel value used where an `em` was required, identical at
 * default zoom and wrong for anyone who changes their browser font size).
 */
test.describe('desktop navigation', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
    await page.goto('/');
  });

  test('exposes a navigation landmark containing every route', async ({
    page,
  }) => {
    const nav = page.getByRole('navigation');

    await expect(nav).toHaveCount(1);

    for (const { path } of CONTENT_ROUTES) {
      await expect(nav.locator(`a[href="${path}"]`)).toBeVisible();
    }
  });

  test('shows inline links for every route and hides the burger', async ({
    page,
  }) => {
    for (const { path } of CONTENT_ROUTES) {
      await expect(
        page.locator(`header a[href="${path}"]`).first()
      ).toBeVisible();
    }

    // The two modes are mutually exclusive: if both are visible the breakpoint
    // has broken, which a screenshot diff would catch but a DOM test would not.
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
  });

  test('matches the approved header layout', async ({ page }) => {
    await expect(page.locator('header')).toHaveScreenshot(
      'desktop-header.png',
      {
        animations: 'disabled',
      }
    );
  });

  test('navigates client-side when an inline link is chosen', async ({
    page,
  }) => {
    await page.locator('header a[href="/travel"]').first().click();

    await expect(page).toHaveURL(/\/travel$/);
    await expect(
      page.getByRole('heading', { name: 'Travel history' })
    ).toBeVisible();
  });
});
