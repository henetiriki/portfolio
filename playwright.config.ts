import { defineConfig, devices } from '@playwright/test';

// Port 3000 is not negotiable. The Google Maps API key is restricted to
// http://localhost:3000 and the production origin, so any other port silently
// fails Maps authorisation. See docs/development.md#browser-regression-suite.
const PORT = 3000;

export const BASE_URL = `http://localhost:${PORT}`;

const isCI = !!process.env.CI;

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
      testIgnore: /\.mobile\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // The mobile drawer has needed several rounds of fixes historically, so
      // it gets a real touch-enabled viewport rather than a resized desktop.
      name: 'mobile-chromium',
      testIgnore: /\.desktop\.spec\.ts$/,
      use: { ...devices['Pixel 7'] },
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
    // one. Service-worker behaviour is verified by the build assertion in CI
    // rather than through the browser suite.
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    video: 'off',
  },
  webServer: {
    command: 'yarn start',
    reuseExistingServer: !isCI,
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
  // seconds a higher count would save on a 76-spec run.
  workers: isCI ? 1 : 4,
});
