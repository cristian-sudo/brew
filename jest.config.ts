module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  testRegex: '.*\\.test\\.ts$',
  clearMocks: true,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
  ],
  coveragePathIgnorePatterns: [
    'src/main.ts',
    'src/cli.ts',
    'src/app.module.ts',
    'src/Seeders/',
    'src/Command/',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -20,
    },
  },
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^csv-stringify/sync':
      '<rootDir>/node_modules/csv-stringify/dist/cjs/sync.cjs',
    '^csv-parse/lib/sync':
      '<rootDir>/node_modules/csv-parse/dist/cjs/sync.cjs',
  },
};
