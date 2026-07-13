/**
 * Minimal Jest config for bug condition exploration tests.
 * These tests use only Node.js fs module (no React Native transforms needed).
 */
module.exports = {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/src/__tests__/bugConditionExploration.test.js'],
  moduleFileExtensions: ['js'],
};
