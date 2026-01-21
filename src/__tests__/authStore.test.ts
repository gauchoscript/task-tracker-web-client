import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    removeQueries: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com' },
      isAuthenticated: true,
    });
    vi.clearAllMocks();
  });

  it('clears query cache on signout', () => {
    useAuthStore.getState().signout();

    expect(queryClient.removeQueries).toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
