import { expect, test } from '@playwright/test';
import {
  CONTENT_ROUTES,
  blockGoogleMaps,
  pinVisualBackground,
} from './support/helpers';

/**
 * Desktop counterpart to `navigation.mobile.spec.ts` — see
 * docs/development.md#browser-regression-suite.
 */
test.describe('desktop navigation', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
    await pinVisualBackground(page);
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

  test(
    'matches the approved header layout',
    { tag: '@visual' },
    async ({ page }) => {
      await expect(page.locator('img[src*="BZ4QGdOn6SP"]')).toBeVisible();

      await expect(page.locator('header')).toHaveScreenshot(
        'desktop-header.png',
        {
          animations: 'disabled',
        }
      );
    }
  );

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
