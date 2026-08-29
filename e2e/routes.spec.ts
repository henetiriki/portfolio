import { expect, test } from '@playwright/test';
import {
  CONTENT_ROUTES,
  blockGoogleMaps,
  collectConsoleErrors,
  isExpectedConsoleNoise,
  waitForHydration,
} from './support/helpers';

test.describe('content routes', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleMaps(page);
  });

  for (const { heading, path, title } of CONTENT_ROUTES) {
    test(`${path} renders and hydrates without console errors`, async ({
      page,
    }) => {
      const consoleErrors = collectConsoleErrors(page);

      await page.goto(path);

      // Asserted as a substring rather than a constructed RegExp: the suffix
      // is shared across pages and a dynamic RegExp trips the security rule.
      expect(await page.title()).toContain(title);
      await expect(
        page.getByRole('heading', { name: heading }).first()
      ).toBeVisible();

      // Proves React actually hydrated. The prerendered HTML is already
      // complete, so a visibility check would pass against static markup.
      await waitForHydration(page);

      expect(
        consoleErrors().filter(text => !isExpectedConsoleNoise(text))
      ).toEqual([]);
    });
  }

  test('the 404 page renders for an unknown route', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('the travel page degrades to its error state when Maps fails', async ({
    page,
  }) => {
    await page.goto('/travel');

    // The map is scrolled into view lazily, so the failure only surfaces once
    // the observer fires — which is itself the behaviour worth protecting.
    await page
      .getByRole('heading', { name: 'Travel history' })
      .scrollIntoViewIfNeeded();

    await expect(
      page.getByText('The map failed to load — please try again later.')
    ).toBeVisible({ timeout: 15_000 });
  });
});
