import { expect, test } from '@playwright/test';
import {
  blockGoogleMaps,
  captureScrollIntoView,
  waitForHydration,
} from './support/helpers';

/**
 * `useScrollTo` picks `scrollIntoView`'s `behavior` from `useReducedMotion`,
 * which reads `prefers-reduced-motion` — jsdom has no media query support, so
 * the unit tests can only assert the hook returns the right string, never that
 * a real reduced-motion user gets an instant jump instead of a smooth scroll.
 * `reducedMotion: 'reduce'` is set only on this project (see
 * playwright.config.ts), specifically so this spec can observe it.
 */
test.describe('reduced motion', () => {
  test('scroll-to-top jumps instantly instead of scrolling smoothly', async ({
    page,
  }) => {
    const behaviors = await captureScrollIntoView(page);

    await blockGoogleMaps(page);

    await page.goto('/experience');
    await waitForHydration(page);

    await page.mouse.wheel(0, 800);
    await page.getByRole('button', { name: 'Scroll to top' }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    expect(behaviors).toEqual(['auto']);
  });
});
