import {defineConfig, globalIgnores} from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import tailwind from 'eslint-plugin-tailwindcss'
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
    'src/components/ui/**' // Ignore shadcn/ui components
  ]),
  ...nextTs,
  ...nextVitals,
  prettierRecommended,
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      // Suppress "Cannot resolve default tailwindcss config path. Please manually set the config option." during lint
      tailwindcss: {
        config: path.join(__dirname, './tailwind.config.mjs')
      }
    },
    rules: {
      camelcase: 'off',
      radix: 'warn',
      'linebreak-style': ['error', 'unix'],
      'no-console': 'off',
      'prettier/prettier': 'warn',
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
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-shorthand': 'off',
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          // Via ChatGPT for use with Tailwind CSS + shadcn/ui design system
          whitelist: [
            'bg-background',
            'text-foreground',
            'bg-card',
            'text-card-foreground',
            'bg-popover',
            'text-popover-foreground',
            'bg-primary',
            'text-primary',
            'text-primary-foreground',
            'bg-secondary',
            'text-secondary',
            'text-secondary-foreground',
            'bg-muted',
            'text-muted-foreground',
            'bg-accent',
            'text-accent-foreground',
            'bg-destructive',
            'text-destructive-foreground',
            'border-border',
            'bg-input',
            'ring-ring',
            'bg-sidebar',
            'text-sidebar-foreground',
            'bg-sidebar-primary',
            'text-sidebar-primary-foreground',
            'bg-sidebar-accent',
            'text-sidebar-accent-foreground',
            'border-sidebar-border',
            'ring-sidebar-ring'
          ]
        }
      ]
    }
  }
])

export default eslintConfig
