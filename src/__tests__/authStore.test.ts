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
      user: { email: 'test@example.com' },
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

  it('sets user info on signin', () => {
    useAuthStore.getState().signout();

    useAuthStore.getState().signin('new-token', 'refresh-token', { email: 'new@example.com' });

    expect(useAuthStore.getState().token).toBe('new-token');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-token');
    expect(useAuthStore.getState().user?.email).toBe('new@example.com');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
