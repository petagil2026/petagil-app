/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Prevent expo winter runtime lazy require() getters from firing after Jest context closes.
    // The winter runtime installs lazy global getters that call require() — if Jest destroys
    // the module registry before these getters fire, it throws "import outside scope".
    '^expo/src/winter$': '<rootDir>/src/__tests__/__mocks__/expo-winter.js',
    '^expo/src/winter/(.*)$': '<rootDir>/src/__tests__/__mocks__/expo-winter.js',
    '^@ungap/structured-clone$': '<rootDir>/src/__tests__/__mocks__/expo-winter.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/**',
    '!src/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  resetMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

module.exports = config
