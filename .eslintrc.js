module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  env: {
    browser: true,
    es2021: true,
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y',
    'react-hooks',
    'security',
    'unused-imports',
  ],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'never', ts: 'never', tsx: 'never' },
    ],
    'import/no-extraneous-dependencies': 'off',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
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
    'no-underscore-dangle': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
