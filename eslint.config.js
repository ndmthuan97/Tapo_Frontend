import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ── React Compiler rules (eslint-plugin-react-hooks v5) ────────────────
      // Codebase không dùng React Compiler — các pattern này là valid React code
      // Downgrade từ error → warn để không block CI
      'react-hooks/react-compiler':             'warn',

      // ── Fast Refresh ───────────────────────────────────────────────────────
      // Mixed export files (component + constants) — common pattern, warn only
      'react-refresh/only-export-components':   ['warn', { allowConstantExport: true }],

      // ── TypeScript ─────────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any':     'warn',
      '@typescript-eslint/no-unused-vars':      ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
  prettierConfig,
])
