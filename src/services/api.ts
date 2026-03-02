import type {
  AuthResponse,
  CreateTaskRequest,
  PaginatedNotifications,
  SigninRequest,
  SignupRequest,
  Task,
  TaskNotification,
  UpdateTaskRequest
} from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const HttpStatus = {
  UNAUTHORIZED: 401,
  NO_CONTENT: 204,
} as const;

// Custom error class for API errors
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Refresh promise to handle concurrent refresh requests
let refreshPromise: Promise<AuthResponse> | null = null;

// Fetch wrapper with auth and 401 handling
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { token, refreshToken, signout } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === HttpStatus.UNAUTHORIZED && refreshToken) {
      return handleTokenRefresh<T>(endpoint, options, headers);
    }

    if (response.status === HttpStatus.UNAUTHORIZED) {
      signout();
    }

    const error = await response.json().catch(() => ({
      detail: response.statusText || 'An error occurred',
    }));

    throw new ApiError(response.status, error.detail);
  }

  // Handle No Content response
  if (response.status === HttpStatus.NO_CONTENT) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Handles the token refresh flow and retries the original request.
 */
async function handleTokenRefresh<T>(
  endpoint: string,
  options: RequestInit,
  originalHeaders: HeadersInit
): Promise<T> {
  const { signin, signout, refreshToken, user } = useAuthStore.getState();

  if (!refreshToken || !user?.email) {
    console.error('Refresh token or user email missing:', { hasRefreshToken: !!refreshToken, hasEmail: !!user?.email });
    signout();
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'No refresh token or user email available');
  }

  try {
    if (!refreshPromise) {
      refreshPromise = authApi.refresh(refreshToken, user.email);
    }

    const refreshResponse = await refreshPromise;
    refreshPromise = null;

    // Update store with new token
    signin(refreshResponse.access_token, refreshResponse.refresh_token);

    // Retry the original request with new token
    const retryHeaders: HeadersInit = {
      ...originalHeaders,
      'Authorization': `Bearer ${refreshResponse.access_token}`,
    };

    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: retryHeaders,
    });

    if (!retryResponse.ok) {
      const error = await retryResponse.json().catch(() => ({
        detail: retryResponse.statusText || 'An error occurred',
      }));
      throw new ApiError(retryResponse.status, error.detail);
    }

    if (retryResponse.status === HttpStatus.NO_CONTENT) {
      return undefined as T;
    }

    return retryResponse.json();
  } catch (refreshErr) {
    refreshPromise = null;
    signout();
    throw refreshErr;
  }
}

// Auth API
export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return fetchWithAuth<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  signin: async (data: SigninRequest): Promise<AuthResponse> => {
    return fetchWithAuth<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  refresh: async (refreshToken: string, email: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken, email }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Refresh failed');
    }

    return response.json();
  },
};

// Tasks API
export const tasksApi = {
  getTasks: async (status?: string): Promise<Task[]> => {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchWithAuth<Task[]>(`/tasks${params}`);
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    return fetchWithAuth<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    return fetchWithAuth<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    return fetchWithAuth<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  moveTask: async (
    id: string,
    above_id?: string,
    below_id?: string
  ): Promise<Task> => {
    return fetchWithAuth<Task>(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ above_id, below_id }),
    });
  },
};

// Notifications API
export const notificationsApi = {
  registerDevice: async (token: string, platform: string = 'web'): Promise<void> => {
    return fetchWithAuth<void>('/notifications/devices', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  },

  getNotifications: async (skip = 0, limit = 20): Promise<PaginatedNotifications> => {
    return fetchWithAuth<PaginatedNotifications>(
      `/notifications?skip=${skip}&limit=${limit}`
    );
  },

  markAsRead: async (notificationId: string, read_source: string = 'web'): Promise<TaskNotification> => {
    return fetchWithAuth<TaskNotification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ read_source }),
    });
  },
};

