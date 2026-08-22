import { defineConfig, devices } from '@playwright/test';

const PRODUCTION_URL = 'https://www.ouwl.house';

export default defineConfig({
  expect: {
    timeout: 60_000,
  },
  forbidOnly: true,
  projects: [
    {
      name: 'production-maps-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['github'], ['html', { open: 'never' }]],
  retries: 2,
  testDir: './e2e',
  testMatch: /maps-smoke\.spec\.ts$/,
  timeout: 90_000,
  use: {
    baseURL: PRODUCTION_URL,
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    video: 'off',
  },
  workers: 1,
});
