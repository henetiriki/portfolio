import { expect, test } from '@playwright/test';

test('the production travel map loads Google Maps', async ({ page }) => {
  const mapScript = page.waitForResponse(
    response =>
      response.ok() &&
      response.url().startsWith('https://maps.googleapis.com/maps/api/js'),
    { timeout: 60_000 }
  );

  await page.goto('/travel', { waitUntil: 'domcontentloaded' });

  const map = page.locator('#map');

  await expect(map).toBeVisible({ timeout: 60_000 });
  await map.scrollIntoViewIfNeeded();
  await mapScript;
  await expect(map.locator('.gm-style')).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole('heading', { name: 'Something’s gone wrong' })
  ).toHaveCount(0);
});
