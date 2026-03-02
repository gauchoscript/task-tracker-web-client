import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { resetMocks } from './mocks/handlers';
import { server } from './mocks/server';

beforeAll(() => server.listen());
beforeEach(() => {
  resetMocks(); // Reset in-memory state
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
