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
  workers: isCI ? 1 : undefined,
});
