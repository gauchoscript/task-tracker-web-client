import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { resetTasks } from './mocks/handlers';
import { server } from './mocks/server';

beforeAll(() => server.listen());
beforeEach(() => {
  resetTasks(); // Reset in-memory state
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
