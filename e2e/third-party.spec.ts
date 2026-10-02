import { expect, test } from '@playwright/test';
import { blockGoogleMaps, waitForHydration } from './support/helpers';
import type { Page } from '@playwright/test';

/**
 * Asserts the YouTube embed's lazy-load *behaviour*, not just the `loading`
 * attribute the unit test covers — see docs/components.md's `VideoContainer`.
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
