/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',
  moduleNameMapper: {
    '@slices': '<rootDir>/src/services/slices/index.ts',
    '@api': '<rootDir>/src/utils/burger-api.ts'
  }
};

export default config;
