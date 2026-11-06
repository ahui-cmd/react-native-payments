/**
 * MIT License
 *
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = {
  rootDir: '..',
  roots: ['<rootDir>/jest'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/jest/__tests__/*-test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/oh_modules/', '/example/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'js/PaymentRequest/PaymentRequestUpdateEvent.js',
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/jest/mocks/react-native.js',
    '^react$': '<rootDir>/jest/mocks/react.js',
  },
  setupFiles: ['<rootDir>/jest/jest.setup.js'],
  transform: {
    '^.+\\.js$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: ['@babel/preset-flow', '@babel/preset-react', ['@babel/preset-env', {targets: {node: 'current'}}]],
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['js/**/*.js', '!js/**/__tests__/**'],
};
