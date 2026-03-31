import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers.js';
import { vi } from 'vitest';
import React from 'react';

export const server = setupServer(...handlers);

// Mock react-helmet-async to prevent crashes when HelmetProvider is missing
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => React.createElement(React.Fragment, null, children),
  HelmetProvider: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// Mock IntersectionObserver for JSDOM
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => server.close());
