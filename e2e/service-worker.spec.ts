import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  isExpectedConsoleNoise,
} from './support/helpers';

/**
 * The other half of installability: generation is not registration.
 *
 * CI asserts a production build emits a non-empty `public/sw.js`, but a worker
 * that never registers — a bad scope, a script the server will not serve, a
 * policy that refuses to start it — produces exactly the same green build. This
 * runs in its own Playwright project, the only one where `serviceWorkers` is
 * left unblocked, so its precache cannot reach any other spec.
 * See docs/development.md#browser-regression-suite, and D-260815a in
 * docs/decisions.md#private-operational-records.
 *
 * Offline is covered here, and the two tests below are deliberately not one.
 * The fallback path and the runtime-cache path fail independently, and only the
 * first was ever broken: `/_offline` was absent from the precache manifest, so
 * an offline navigation to an unvisited route produced no response at all,
 * while a visited route kept working from cache and made the whole thing look
 * healthy. A single test on a visited page passes without the fallback ever
 * being consulted, which is exactly how the manual check missed it.
 * See docs/decisions.md#d-260815g, and D-260815f in
 * docs/decisions.md#private-operational-records.
 *
 * A regression here surfaces as a timeout rather than a failed assertion:
 * `navigator.serviceWorker.ready` never settles when registration does not
 * happen, so there is nothing to compare against. Verified by re-running this
 * project with `serviceWorkers: 'block'` — both tests time out.
 */
test.describe('service worker', () => {
  test('registers, activates and takes control of the page', async ({
    page,
  }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto('/');

    const registration = await page.evaluate(async () => {
      const { active, scope } = await navigator.serviceWorker.ready;

      return { scope, scriptURL: active?.scriptURL ?? null };
    });

    // A worker scoped below the origin root would register happily and control
    // nothing, which is the failure this pins down rather than "it registered".
    const { origin } = new URL(page.url());

    expect(registration).toEqual({
      scope: `${origin}/`,
      scriptURL: `${origin}/sw.js`,
    });

    // `clientsClaim` is set, so the worker takes over this page without a
    // reload. Without it the first visit of every session would go unhandled.
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);

    const errors = consoleErrors().filter(
      message => !isExpectedConsoleNoise(message)
    );

    expect(errors).toEqual([]);
    // Registration resolving is what makes `registration.waiting` readable, so
    // the noise the blocking projects have to filter is theirs, not the app's.
    expect(consoleErrors().filter(message => /waiting/.test(message))).toEqual(
      []
    );
  });

  test('precaches manifest icons but not the Apple splash images', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);

    // The precache cache's own name is scope-dependent (see
    // docs/pwa-seo.md), so it's found by content rather than hardcoded.
    const precachedPaths = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const precacheName = cacheNames.find(name => name.includes('precache'));

      if (!precacheName) {
        return [];
      }

      const cache = await caches.open(precacheName);
      const requests = await cache.keys();

      return requests.map(request => new URL(request.url).pathname);
    });

    // Discriminates against an empty or wrong cache being found: this only
    // passes if manifest-icon-512.png, which is meant to stay precached, is
    // actually in it.
    expect(precachedPaths).toContain(
      '/images/manifest-icons/manifest-icon-512.png'
    );
    expect(precachedPaths.some(path => path.includes('apple-splash-'))).toBe(
      false
    );
  });

  test('answers a navigation from its fetch handler', async ({ page }) => {
    // The context is fresh, so nothing is registered yet and this first
    // navigation must come from the network. Asserted rather than assumed,
    // because it is what makes the reload below discriminating: a
    // `fromServiceWorker()` that returned true either way would prove nothing.
    const first = await page.goto('/');

    expect(first?.fromServiceWorker()).toBe(false);

    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);

    // A worker that starts but registers no fetch handler satisfies every
    // assertion above and still serves nothing. This is also the first thing in
    // the suite to exercise the policy's `worker-src` directive.
    const second = await page.reload();

    expect(second?.fromServiceWorker()).toBe(true);
  });

  test('serves the offline page for a route it has never seen', async ({
    context,
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);

    await context.setOffline(true);
    // A route deliberately not visited above, so nothing can answer it from the
    // runtime cache and the precached fallback is the only possible source.
    await page.goto('/travel');

    await expect(
      page.getByRole('heading', { name: 'You might’ve lost connectivity' })
    ).toBeVisible();
  });

  test('serves a visited route from cache while offline', async ({
    context,
    page,
  }) => {
    await page.goto('/experience');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    // The worker took control after this page was fetched, so its HTML is not
    // in the runtime cache yet. One reload under the worker is what puts it
    // there, and is the step this test would otherwise silently skip.
    await page.reload();

    await context.setOffline(true);
    await page.reload();

    await expect(
      page.getByRole('heading', { name: 'You might’ve lost connectivity' })
    ).toBeHidden();
    await expect(page).toHaveTitle(/Experience/);
  });
});
