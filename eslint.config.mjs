import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import security from 'eslint-plugin-security';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import sortKeys from 'eslint-plugin-sort-keys';
import typescriptSortKeys from 'eslint-plugin-typescript-sort-keys';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { config, configs } from 'typescript-eslint';

// Mirrors the glob `eslint-config-next` registers `react`, `react-hooks`,
// `import` and `jsx-a11y` against. Note it excludes `.cjs`, which is why
// `postcss.config.cjs` gets core rules only.
const WEB_FILES = ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'];
const TS_FILES = ['**/*.ts', '**/*.tsx'];

// `eslint-config-next` already registers `react`, `react-hooks`, `import`,
// `jsx-a11y`, `@next/next` and `@typescript-eslint`. Flat config treats
// registering the same plugin name twice as a hard error ("Cannot redefine
// plugin"), so the shared recommended presets below are pulled in for their
// rules and settings only, with the duplicate `plugins` key dropped — and
// scoped to the same files the plugin was registered against, since applying
// a rule to a file whose config never registered its plugin is also an error.
const preset = (sharedConfig, files) => {
  const { plugins: _plugins, ...rest } = sharedConfig;

  return { ...rest, files };
};

export default config(
  {
    ignores: ['.yarn/', '.next/', 'coverage/', 'next-env.d.ts', 'public/sw.js'],
  },
  ...nextCoreWebVitals,
  preset(react.configs.flat.recommended, WEB_FILES),
  preset(react.configs.flat['jsx-runtime'], WEB_FILES),
  preset(jsxA11y.flatConfigs.recommended, WEB_FILES),
  preset(importPlugin.flatConfigs.recommended, WEB_FILES),
  preset(importPlugin.flatConfigs.typescript, WEB_FILES),
  security.configs.recommended,
  ...configs.recommended.map(sharedConfig => preset(sharedConfig, TS_FILES)),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys': sortKeys,
      'typescript-sort-keys': typescriptSortKeys,
      'unused-imports': unusedImports,
    },
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'no-cond-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-multiple-empty-lines': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../'],
        },
      ],
      'no-sequences': 'error',
      'no-underscore-dangle': 'off',
      'no-unneeded-ternary': 'error',
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', next: 'return', prev: '*' },
        { blankLine: 'always', next: '*', prev: ['const', 'let', 'var'] },
        {
          blankLine: 'any',
          next: ['const', 'let', 'var'],
          prev: ['const', 'let', 'var'],
        },
      ],
      'prefer-spread': 'error',
      'sort-destructure-keys/sort-destructure-keys': [
        'error',
        { caseSensitive: true },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          memberSyntaxSortOrder: ['all', 'multiple', 'single', 'none'],
        },
      ],
      'sort-keys': 'off',
      'sort-keys/sort-keys-fix': [
        'error',
        'asc',
        { caseSensitive: true, natural: true },
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: WEB_FILES,
    rules: {
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': 'off',
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
        },
      ],
      'import/prefer-default-export': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/jsx-key': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-no-script-url': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-sort-props': 'error',
      'react/no-danger': 'error',
      'react/no-unknown-property': 'error',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/sort-prop-types': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // The three rules below are new in eslint-plugin-react-hooks 7, which
      // arrives with eslint-config-next 16. Each flags a long-standing
      // pattern rather than anything this upgrade introduced:
      //   set-state-in-effect - useIgImgId's route-change shimmer reset and
      //                         useRailTrips' fetch gate
      //   refs                - useDeepCompareMemoize reading/writing
      //                         ref.current during render
      //   immutability        - Map.tsx's self-recursive zoomMap callback
      // Fixing them means restructuring hooks with real behavioural and
      // visual-regression risk, which is out of scope for a dependency
      // upgrade. Demoted to warnings so the signal stays visible rather than
      // being switched off. Tracked in docs/roadmap.md.
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: TS_FILES,
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      'typescript-sort-keys/interface': 'error',
      'typescript-sort-keys/string-enum': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'jest.setup.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  prettier
);
