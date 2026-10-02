import type { Page, Route } from '@playwright/test';

export const CONTENT_ROUTES = [
  { heading: 'Louw Swart', path: '/', title: 'Front-End Engineer' },
  {
    heading: 'Work History',
    path: '/experience',
    title: 'Front-End & Full-Stack Experience',
  },
  {
    heading: 'Website portfolio',
    path: '/portfolio',
    title: 'Freelance Web Design Portfolio',
  },
  { heading: 'Travel history', path: '/travel', title: 'Places I’ve Been' },
  { heading: 'Contact', path: '/contact', title: 'Get In Touch' },
] as const;

/**
 * Google Maps is never contacted from the browser suite — see
 * docs/development.md#browser-regression-suite.
 */
export const blockGoogleMaps = (page: Page) =>
  page.route('**://*.googleapis.com/**', (route: Route) => route.abort());

const VISUAL_BACKGROUND_IMAGE_ID = 'BZ4QGdOn6SP';

/**
 * Keep screenshot assertions independent of the production image rotation —
 * see docs/development.md#visual-baseline-updates.
 */
export const pinVisualBackground = (page: Page) =>
  page.route('**/api/img-id', route =>
    route.fulfill({ json: { imgId: VISUAL_BACKGROUND_IMAGE_ID } })
  );

/**
 * Records `scrollIntoView` behaviour — see docs/development.md#browser-regression-suite.
 * Call and await before `page.goto`: init scripts only affect later navigations.
 */
export const captureScrollIntoView = async (page: Page) => {
  const behaviours: string[] = [];

  await page.exposeFunction('__onScrollIntoView', (behaviour: string) => {
    behaviours.push(behaviour);
  });
  await page.addInitScript(() => {
    const original = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = function (
      this: Element,
      options?: boolean | ScrollIntoViewOptions
    ) {
      const behaviour =
        options && typeof options === 'object'
          ? (options.behavior ?? 'auto')
          : 'auto';

      // @ts-expect-error -- injected by page.exposeFunction, not a real DOM global
      window.__onScrollIntoView(behaviour);

      return original.call(this, options as ScrollIntoViewOptions);
    };
  });

  return behaviours;
};

/**
 * Returns a getter, rather than asserting directly, so each spec decides when
 * to check and can filter noise it legitimately expects via `isExpectedConsoleNoise`.
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
 * WCAG relative luminance and contrast ratio — see
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance.
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
 * Console output the suite expects, for reasons outside the app's control —
 * see docs/development.md#browser-regression-suite.
 */
export const isExpectedConsoleNoise = (message: string) =>
  /googleapis|maps|ERR_FAILED|Failed to load resource/i.test(message) ||
  /_vercel\/(speed-)?insights/i.test(message) ||
  /reading 'waiting'/.test(message);

/**
 * Wait until React has actually hydrated — see
 * docs/development.md#browser-regression-suite.
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
