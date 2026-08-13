import { expect, test } from '@playwright/test';
import { blockGoogleMaps, waitForHydration } from './support/helpers';
import type { Page } from '@playwright/test';

/**
 * The YouTube embed on /experience sits roughly 35,000px down a 39,000px
 * page, and a bare `youtube.com/embed` frame costs about a megabyte of player
 * JavaScript. Loading it eagerly put that work on the main thread during
 * initial load — for content almost nobody scrolls to — and measurably hurt
 * that route's PageSpeed score relative to every other page, including
 * /travel, whose far heavier Google Map is deferred until it is in view.
 *
 * These specs assert the *behaviour* rather than the `loading` attribute: the
 * unit test already covers the attribute, and an attribute alone would not
 * catch a future change that reintroduces an eager third-party by some other
 * route. Requests are stubbed rather than allowed through, so the suite gains
 * no dependency on YouTube being reachable.
 */
test.describe('third-party embeds', () => {
  const countYouTubeRequests = async (page: Page) => {
    let requests = 0;

    await page.route('**://*.youtube.com/**', route => {
      requests += 1;

      return route.fulfill({
        body: '<!doctype html><title>stub</title>',
        contentType: 'text/html',
        status: 200,
      });
    });

    return () => requests;
  };

  test('does not load the YouTube player on initial page load', async ({
    page,
  }) => {
    await blockGoogleMaps(page);

    const youTubeRequests = await countYouTubeRequests(page);

    await page.goto('/experience');
    await waitForHydration(page);

    expect(youTubeRequests()).toBe(0);
  });

  test('loads the YouTube player once it is scrolled into view', async ({
    page,
  }) => {
    await blockGoogleMaps(page);

    const youTubeRequests = await countYouTubeRequests(page);

    await page.goto('/experience');
    await waitForHydration(page);

    // Proves deferring did not simply break the embed. A "fix" that stops the
    // video ever loading would pass the assertion above on its own.
    await page.locator('iframe').scrollIntoViewIfNeeded();

    await expect.poll(youTubeRequests).toBeGreaterThan(0);
  });
});
