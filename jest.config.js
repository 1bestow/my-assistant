module.exports = {
  testEnvironment: 'jest-environment-jsdom',

  collectCoverageFrom: [
    'app.js',
    'sw.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  testMatch: ['**/tests/**/*.test.js']
};
