import type { Page, Route } from '@playwright/test';

export const CONTENT_ROUTES = [
  { heading: 'Louw Swart', path: '/', title: 'Portfolio' },
  { heading: 'Work History', path: '/experience', title: 'Experience' },
  { heading: 'Website portfolio', path: '/portfolio', title: 'Portfolio' },
  { heading: 'Travel history', path: '/travel', title: 'Travel' },
  { heading: 'Contact', path: '/contact', title: 'Contact' },
] as const;

/**
 * Google Maps is never contacted from the browser suite.
 *
 * The API key is restricted by origin and CI supplies a dummy key, so a real
 * load would behave differently between a developer's machine and CI — exactly
 * the flakiness a regression suite must not have. The Maps layer already has
 * its own SDK mock and full unit coverage; what this suite checks is that the
 * page around it degrades correctly.
 *
 * This block is why the suite needs no particular port.
 */
export const blockGoogleMaps = (page: Page) =>
  page.route('**://*.googleapis.com/**', (route: Route) => route.abort());

/**
 * Fail a test on unexpected console errors.
 *
 * Returns a getter rather than asserting directly so each spec decides when to
 * check, and can filter the noise it legitimately expects (an aborted Maps
 * request, for instance, surfaces as a network error).
 */
export const collectConsoleErrors = (page: Page) => {
  const errors: string[] = [];

  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', error => errors.push(error.message));

  return () => errors;
};

/**
 * Console output the suite expects, for reasons outside the app's control.
 *
 * - Maps requests are deliberately aborted (see `blockGoogleMaps`).
 * - `/_vercel/insights` and `/_vercel/speed-insights` are injected by Vercel's
 *   analytics scripts but only served by Vercel's edge. Under a local
 *   `next start` they fall through to the 404 handler and come back as
 *   `text/plain`, which this app's `nosniff` header then correctly refuses.
 *   That is a local-environment artefact, not a defect.
 * - `reading 'waiting'` comes from `@serwist/window`, which reads
 *   `registration.waiting` after registering the service worker. These projects
 *   set `serviceWorkers: 'block'`, so registration never resolves and that
 *   property read throws. It is the suite's own configuration rather than a
 *   defect, and `service-worker.spec.ts` asserts as much: in the one project
 *   that lets registration succeed, the error does not appear at all.
 */
export const isExpectedConsoleNoise = (message: string) =>
  /googleapis|maps|ERR_FAILED|Failed to load resource/i.test(message) ||
  /_vercel\/(speed-)?insights/i.test(message) ||
  /reading 'waiting'/.test(message);

/**
 * Wait until React has actually hydrated.
 *
 * Checked by looking for a React fibre on a real DOM node rather than by
 * waiting for a visible element, because the prerendered HTML is fully
 * populated before hydration — so any "is it on screen?" assertion passes
 * against static markup and proves nothing about interactivity. This is also
 * viewport-independent, unlike keying off nav links that are CSS-hidden on
 * mobile.
 */
export const waitForHydration = (page: Page) =>
  page.waitForFunction(() => {
    const walk = (element: Element): boolean => {
      for (const key in element) {
        if (key.startsWith('__react')) {
          return true;
        }
      }

      return [...element.children].some(walk);
    };

    return walk(document.body);
  });
