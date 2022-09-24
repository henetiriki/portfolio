module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['next/core-web-vitals', 'prettier'],
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y',
    'react-hooks',
    'security',
    'sort-destructure-keys',
    'sort-keys',
    'unused-imports',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^h|Fragment$',
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'import/order': [
      'warn',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: [
          'builtin',
          'external',
          'parent',
          'sibling',
          'internal',
          'object',
          'type',
          'index',
        ],
      },
    ],
    'import/prefer-default-export': 'off',
    'newline-after-var': 'warn',
    'newline-before-return': 'warn',
    'no-multiple-empty-lines': 'warn',
    'no-underscore-dangle': 'off',
    'no-unneeded-ternary': 'warn',
    'react/function-component-definition': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'react/jsx-sort-props': 'warn',
    'react/self-closing-comp': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'sort-destructure-keys/sort-destructure-keys': [
      'warn',
      { caseSensitive: true },
    ],
    'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        memberSyntaxSortOrder: ['all', 'multiple', 'single', 'none'],
      },
    ],
    'sort-keys': 'off',
    'sort-keys/sort-keys-fix': [
      'warn',
      'asc',
      { caseSensitive: true, natural: true },
    ],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
  },
};
