const preset = require('@react-native/jest-preset/jest-preset');

const esmPackages = [
  '@faker-js/faker',
  '(jest-)?react-native',
  '@react-native(-community)?',
  '@reduxjs/toolkit',
  'immer',
  'react-native-mmkv',
  'react-native-nitro-modules',
  'react-redux',
  'redux-persist',
  'reselect',
];

module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    ...preset.moduleNameMapper,
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  setupFiles: [...preset.setupFiles, '<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [`node_modules/(?!((${esmPackages.join('|')})/))`],
};
