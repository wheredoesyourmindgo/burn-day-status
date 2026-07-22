import {defineConfig, globalIgnores} from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'
import tailwind from 'eslint-plugin-tailwindcss'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const eslintConfig = defineConfig([
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/components/ui/**', // Ignore shadcn/ui components
    'src/lib/utils.ts' // shadcn/ui vendor lib
  ]),
  ...nextTs,
  ...nextVitals,
  // eslint-plugin-tailwindcss v4 exposes a single flat-config object at
  // `configs.recommended` (the v3 `configs['flat/recommended']` array is gone)
  tailwind.configs.recommended,
  {
    // Match the file globs eslint-config-next registers its plugins for, so
    // the tailwindcss rule overrides below apply wherever the plugin (v4)
    // above is registered.
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    // eslint-plugin-tailwindcss v4's `recommended` config above only
    // registers the plugin for its own `files` globs; re-register the same
    // instance here so it's available to the rule overrides below.
    plugins: {
      tailwindcss: tailwind
    },
    languageOptions: {
      parserOptions: {
        ...jsxA11y.flatConfigs.recommended.languageOptions?.parserOptions
      }
    },
    settings: {
      // eslint-plugin-tailwindcss v4 resolves the theme from the Tailwind v4
      // CSS entry point (not the legacy JS config)
      tailwindcss: {
        cssConfigPath: path.join(__dirname, './src/app/globals.css')
      }
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      camelcase: 'off',
      radix: 'warn',
      'no-console': 'off',
      'react/no-unescaped-entities': 'off',
      'react/self-closing-comp': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      // prettier-plugin-tailwindcss owns class ordering; the eslint rule
      // disagrees with it, so keep it off to avoid churn
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/enforces-shorthand': 'off',
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: [
            // shadcn/ui CSS-variable color tokens: any utility prefix +
            // token name (incl. chart-1..5 and -foreground variants) +
            // optional opacity modifier (e.g. bg-primary/10)
            '(bg|text|border|border-[tblrxy]|ring|from|to|via|fill|stroke|shadow|divide|outline|decoration)-(background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|border|ring|sidebar|chart)([a-z0-9-]*)?(/\\d+)?',
            // Custom font family utility from globals.css @theme
            'font-display'
          ]
        }
      ]
    }
  },
  prettierConfig
])

export default eslintConfig
