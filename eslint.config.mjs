import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const noFixedPause =
  'Wait for an element or a condition instead of pausing for a fixed time.';

export default defineConfig(
  { ignores: ['node_modules/', 'reports/', 'allure-results/', 'allure-report/', 'apps/'] },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // A forgotten `await` on a WebdriverIO call is the most common cause of
      // flaky mobile tests, so these two are errors rather than warnings.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      'no-restricted-properties': [
        'error',
        { object: 'browser', property: 'pause', message: noFixedPause },
        { object: 'driver', property: 'pause', message: noFixedPause },
      ],
    },
  },
);
