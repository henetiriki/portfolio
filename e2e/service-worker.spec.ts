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
 * See docs/development.md#browser-regression-suite and docs/decisions.md#d-260815a.
 *
 * Deliberately not offline coverage: `/_offline` stays a manual check on the
 * release checklist.
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
});
