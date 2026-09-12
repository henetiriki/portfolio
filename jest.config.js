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
    'scripts/**/*.mjs',
    '!scripts/**/__tests__/**',
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
  // `scripts/` is included because nothing else covers it: it is outside
  // tsconfig's `include` (`**/*.ts(x)`), and unlike the other untyped files
  // here a wrong answer breaks no build — CI just runs the wrong checks.
  // `scripts/` shares the same coverage floor as `src/` above — each script's
  // CLI-entry `main()` is marked `/* istanbul ignore next */`, since it is
  // exercised by running the script rather than by importing it under test.
  testMatch: ['<rootDir>/{src,scripts}/**/__tests__/**/*.test.{ts,tsx}'],
};

module.exports = createJestConfig(customJestConfig);
