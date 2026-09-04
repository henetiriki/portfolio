const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!src/pages/_offline.tsx',
    '!src/utils/test/**',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  // `scripts/` is included because it is the only executable code here with
  // neither type checking (tsconfig's `include` is `**/*.ts(x)` only) nor tests,
  // and CI now depends on one of those scripts to decide what it runs.
  // `collectCoverageFrom` stays scoped to `src/`, so the floor is unaffected.
  testMatch: ['<rootDir>/{src,scripts}/**/__tests__/**/*.test.{ts,tsx}'],
};

module.exports = createJestConfig(customJestConfig);
