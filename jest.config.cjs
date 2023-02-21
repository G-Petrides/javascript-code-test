/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.m?js$": "babel-jest"
  }
};