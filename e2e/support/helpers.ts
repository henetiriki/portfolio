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

const VISUAL_BACKGROUND_IMAGE_ID = 'BZ4QGdOn6SP';

/**
 * Keep screenshot assertions independent of the production image rotation.
 *
 * FixedBackground asks this endpoint for one configured image after hydration.
 * Intercepting the request before navigation preserves the production code
 * path, while letting visual specs compare the same rendered background on
 * every run without narrowing the image pool used by the rest of CI.
 */
export const pinVisualBackground = (page: Page) =>
  page.route('**/api/img-id', route =>
    route.fulfill({ json: { imgId: VISUAL_BACKGROUND_IMAGE_ID } })
  );

/**
 * Record every `behavior` passed to `Element.prototype.scrollIntoView`.
 *
 * `useScrollTo` (see src/hooks/useScrollTo.ts) is the only caller of
 * `scrollIntoView` in the app, from two separate call sites — the header's
 * scroll-to-top button and the footer's nav links. Patching the prototype
 * catches both, and is the only way to observe the `behavior` argument at
 * all: the resulting scroll position cannot tell `'smooth'` from `'auto'`
 * apart, and a footer link's own navigation can move `scrollY` to 0 by
 * itself, independent of whether `scrollToTop` ran.
 *
 * Must be called, and awaited, before `page.goto` — both `exposeFunction` and
 * `addInitScript` only take effect on navigations that start after them.
 */
export const captureScrollIntoView = async (page: Page) => {
  const behaviors: string[] = [];

  await page.exposeFunction('__onScrollIntoView', (behavior: string) => {
    behaviors.push(behavior);
  });
  await page.addInitScript(() => {
    const original = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = function (
      this: Element,
      options?: boolean | ScrollIntoViewOptions
    ) {
      const behavior =
        options && typeof options === 'object'
          ? (options.behavior ?? 'auto')
          : 'auto';

      // @ts-expect-error -- injected by page.exposeFunction, not a real DOM global
      window.__onScrollIntoView(behavior);

      return original.call(this, options as ScrollIntoViewOptions);
    };
  });

  return behaviors;
};

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
 * WCAG relative luminance and contrast ratio, from computed `rgb()`/`rgba()`
 * colour strings. https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *
 * Exists because `axe-core`'s `color-contrast` rule only evaluates text
 * nodes — an SVG icon painted with `stroke="currentColor"` is invisible to
 * it regardless of how badly it fails. See docs/decisions.md#d-260821a.
 */
export const contrastRatio = (a: string, b: string): number => {
  const relativeLuminance = (colour: string): number => {
    const [r, g, b] = colour.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    const channel = (value: number) => {
      const srgb = value / 255;

      return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  );

  return (lighter + 0.05) / (darker + 0.05);
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
