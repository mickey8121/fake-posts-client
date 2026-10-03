/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

beforeEach(() => {
  jest.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
