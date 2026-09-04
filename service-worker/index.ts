import {
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist';
import type {
  PrecacheEntry,
  RuntimeCaching,
  SerwistGlobalConfig,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Not Node's `process`: webpack replaces this expression with a string literal
// at build time, so nothing named `process` survives into the worker. Declared
// here because the worker project deliberately has no Node types.
declare const process: { env: { NEXT_PUBLIC_LAST_MODIFIED?: string } };

// Every matcher is gated on `sameOrigin`, which is the whole point rather than
// a detail: an intercepted request is re-issued from the worker, where the only
// fetch directive that applies is `connect-src`. See D-260815f in
// docs/decisions.md#private-operational-records. The precache route is
// registered before these, so precached assets
// are unaffected by the strategies below.
const runtimeCaching: RuntimeCaching[] = [
  {
    handler: new StaleWhileRevalidate({
      cacheName: 'next-image',
      plugins: [
        new ExpirationPlugin({
          maxAgeFrom: 'last-used',
          maxAgeSeconds: 1440 * 60,
          maxEntries: 64,
        }),
      ],
    }),
    matcher: ({ sameOrigin, url }) =>
      sameOrigin && url.pathname === '/_next/image',
  },
  {
    handler: new NetworkFirst({
      cacheName: 'same-origin',
      plugins: [
        new ExpirationPlugin({ maxAgeSeconds: 1440 * 60, maxEntries: 32 }),
      ],
    }),
    matcher: ({ sameOrigin }) => sameOrigin,
  },
];

// The build manifest carries `/_offline`'s JavaScript chunk but never its HTML
// document: it is prerendered to `.next/server/`, which the Serwist webpack
// plugin excludes, so nothing else puts the page itself in the precache. Adding
// it here is what makes the fallback below resolvable at all. See
// docs/decisions.md D-260815g.
const precacheEntries = [
  ...(self.__SW_MANIFEST ?? []),
  { revision: process.env.NEXT_PUBLIC_LAST_MODIFIED ?? null, url: '/_offline' },
];

const serwist = new Serwist({
  clientsClaim: true,
  fallbacks: {
    entries: [
      {
        matcher: ({ request }) => request.destination === 'document',
        url: '/_offline',
      },
    ],
  },
  navigationPreload: true,
  precacheEntries,
  runtimeCaching,
  skipWaiting: true,
});

serwist.addEventListeners();
