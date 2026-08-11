import { expect, test } from '@playwright/test';
import { blockGoogleMaps, waitForHydration } from './support/helpers';
import type { Page } from '@playwright/test';

/**
 * The scroll-driven navigation background and the scroll-to-top control are
 * pure browser behaviour: a passive `scroll` listener flips state past a 10px
 * threshold, and the header's background colour follows. jsdom has no layout
 * and no scrolling, so the unit tests can only simulate the event — they
 * cannot observe that the header actually changes appearance, or that the
 * control returns the page to the top.
 *
 * Runs on both viewports: the header is shared, and the threshold logic sits
 * outside the breakpoint that splits the two navigation modes.
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
