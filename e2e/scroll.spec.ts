import { expect, test } from '@playwright/test';
import {
  blockGoogleMaps,
  captureScrollIntoView,
  waitForHydration,
} from './support/helpers';
import type { Page } from '@playwright/test';

/**
 * Pure browser behaviour jsdom cannot observe — see
 * docs/development.md#browser-regression-suite.
 */
test.describe('scroll behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
    await page.goto('/experience');
    await waitForHydration(page);
  });

  const headerBackground = (page: Page) =>
    page
      .locator('header')
      .first()
      .evaluate(element => getComputedStyle(element).backgroundColor);

  test('header is transparent at the top and opaque once scrolled', async ({
    page,
  }) => {
    expect(await headerBackground(page)).toBe('rgba(0, 0, 0, 0)');

    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => headerBackground(page))
      .not.toBe('rgba(0, 0, 0, 0)');

    await page.mouse.wheel(0, -600);
    await expect.poll(() => headerBackground(page)).toBe('rgba(0, 0, 0, 0)');
  });

  test('scroll-to-top control appears past the threshold and returns to the top', async ({
    page,
  }) => {
    const control = page.getByRole('button', { name: 'Scroll to top' });

    await expect(control).toBeHidden();

    await page.mouse.wheel(0, 800);
    await expect(control).toBeVisible();

    await control.click();

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(control).toBeHidden();
  });
});

/**
 * A separate `useScrollTo` call site the describe block above cannot exercise
 * — see docs/development.md#browser-regression-suite.
 */
test.describe('footer scroll-to-top', () => {
  test("clicking a footer nav link triggers the page's own scroll-to-top", async ({
    page,
  }) => {
    const behaviours = await captureScrollIntoView(page);

    await blockGoogleMaps(page);

    await page.goto('/experience');
    await waitForHydration(page);

    await page
      .locator('footer')
      .getByRole('link', { exact: true, name: 'Experience' })
      .click();

    await expect.poll(() => behaviours).toEqual(['smooth']);
  });
});
