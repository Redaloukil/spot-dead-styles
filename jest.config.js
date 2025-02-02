/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '/**/*.test.ts',
  ],
  globals: {
      'ts-jest': {
          useESM: true, // Enable ES Module support
      },
  },
  extensionsToTreatAsEsm: ['.ts'], // Treat TypeScript files as ESM
};