// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactNative from 'eslint-plugin-react-native'
import lingui from 'eslint-plugin-lingui'
import prettierConfig from 'eslint-config-prettier'

export default [
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      '.expo-shared/**',
      'dist/**',
      'build/**',
      '*.tsbuildinfo',
      '.env',
      '.env.*',
      '.DS_Store',
      '.vscode/**',
      '.idea/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
  },

  // File patterns
  {
    files: ['src/**/*.{ts,tsx}'],
  },

  // CommonJS test mocks (.js)
  {
    files: ['src/__tests__/__mocks__/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Language options
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        __DEV__: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },

  // React plugin configuration
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React recommended rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Custom overrides
      'react/prop-types': 'off', // TypeScript handles this
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Lingui plugin: signal hardcoded user-facing strings
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { lingui },
    rules: {
      'lingui/no-unlocalized-strings': [
        'warn',
        {
          ignore: [
            '^\\s*$',
            '^[\\d\\s\\p{P}\\p{S}]+$',
            '^[A-Z][A-Z0-9_]*$',
          ],
          ignoreNames: [
            'style', 'styles', 'testID', 'accessibilityRole',
            'id', 'key', 'name', 'type', 'role',
            'as', 'variant', 'size', 'color',
            'displayName', 'maxLength', 'autoComplete',
            'enterKeyHint', 'inputMode', 'pattern',
            'keyboardType', 'returnKeyType', 'autoCapitalize',
            'href', 'src', 'srcSet', 'rel', 'target',
          ],
          ignoreFunctions: [
            'console.*', 'Error', 'TypeError',
            'queryKey', 'invalidateQueries', 'getQueryData', 'setQueryData',
            'Symbol', 'Symbol.for',
            'AsyncStorage.*', 'SecureStore.*',
            'StyleSheet.create',
          ],
        },
      ],
      'lingui/t-call-in-function': 'error',
      'lingui/no-single-variables-to-translate': 'error',
      'lingui/no-expression-in-message': 'error',
      'lingui/no-trans-inside-trans': 'error',
    },
  },
  {
    files: [
      '**/*.test.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
      '**/__mocks__/**/*.{ts,tsx,js}',
    ],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Prettier config (must be last)
  prettierConfig,
]
