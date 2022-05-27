/** @type {import('ts-jest/out/types').InitialOptionsTsJest} */
'use strict';
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
}
