module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  globals: {
    'ts-jest': { diagnostics: false, tsconfig: 'tsconfig.jest.json' },
  },
}
