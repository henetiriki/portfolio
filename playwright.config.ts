import { defineConfig, devices } from '@playwright/test';

// 3001 rather than 3000, which is left free for `next dev`.
// See docs/development.md#browser-regression-suite.
const PORT = 3001;

export const BASE_URL = `http://localhost:${PORT}`;

const isCI = !!process.env.CI;

// Routed by filename, like the viewport-specific specs — this one runs only in
// the project that lets a service worker register, and nowhere else.
const SERVICE_WORKER_SPEC = /service-worker\.spec\.ts$/;

// Routed by filename, like the specs above — this one runs only in the
// project that emulates `prefers-reduced-motion: reduce`, and nowhere else.
const REDUCED_MOTION_SPEC = /reduced-motion\.spec\.ts$/;

export default defineConfig({
  // Deliberately narrower than the Jest suite: this exists to catch real
  // browser behaviour (layout, focus order, hydration, contrast) that jsdom
  // structurally cannot, not to duplicate DOM assertions.
  expect: {
    timeout: 5_000,
  },
  forbidOnly: isCI,
  fullyParallel: true,
  projects: [
    // Viewport-specific specs are routed by filename rather than skipped at
    // runtime. A permanently skipped test teaches you to ignore the skip
    // count, which is exactly when a genuinely skipped test slips past.
    {
      name: 'desktop-chromium',
      testIgnore: [
        /\.mobile\.spec\.ts$/,
        SERVICE_WORKER_SPEC,
        REDUCED_MOTION_SPEC,
      ],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // The mobile drawer has needed several rounds of fixes historically, so
      // it gets a real touch-enabled viewport rather than a resized desktop.
      name: 'mobile-chromium',
      testIgnore: [
        /\.desktop\.spec\.ts$/,
        SERVICE_WORKER_SPEC,
        REDUCED_MOTION_SPEC,
      ],
      use: { ...devices['Pixel 7'] },
    },
    {
      // The one project that lets a service worker register. It is a separate
      // project rather than a relaxed setting on the others because the block
      // below is load-bearing for them, not incidental.
      // See docs/decisions.md#d-260815a.
      name: 'service-worker-chromium',
      testMatch: SERVICE_WORKER_SPEC,
      use: { ...devices['Desktop Chrome'], serviceWorkers: 'allow' },
    },
    {
      // The one project that emulates `prefers-reduced-motion: reduce`, so it
      // is also the only place that setting could plausibly leak into another
      // spec's result — kept to its own filename-routed spec for the same
      // reason the service-worker project is isolated above.
      name: 'reduced-motion-chromium',
      testMatch: REDUCED_MOTION_SPEC,
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
  ],
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  retries: isCI ? 1 : 0,
  testDir: './e2e',
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    // The suite serves a production build, which now always ships a service
    // worker. Left unblocked it would precache pages and serve them to later
    // specs, so a spec could pass against a stale response from an earlier
    // one. The `service-worker-chromium` project above opts back in, alone.
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    video: 'off',
  },
  webServer: {
    // `next start` defaults to 3000, so the port has to be passed as well as
    // waited on — `url` alone would wait on 3001 for a server bound to 3000.
    command: `yarn start --port ${PORT}`,
    // Never reused. On a port of its own there is nothing legitimate to attach
    // to, and attaching to a stale server was a repeat source of failures that
    // looked like regressions. See docs/development.md#browser-regression-suite.
    reuseExistingServer: false,
    // A production server is the right target: it exercises the prerendered
    // output that actually ships, and `next dev` would compile routes lazily
    // on first hit, making the first navigation in each spec arbitrarily slow.
    timeout: 120_000,
    url: BASE_URL,
  },
  // Capped deliberately rather than left at one worker per core. Every spec
  // loads the fixed background photo, so each page triggers a `/_next/image`
  // optimisation on the single `next start` process — sharp work on one event
  // loop. Saturating that produced scattered, irreproducible failures across
  // unrelated specs; the same run passes serially. A suite that needs a re-run
  // to be believed is worse than no suite, so determinism wins over the few
  // seconds a higher count would save on a 78-spec run.
  workers: isCI ? 1 : 4,
});
