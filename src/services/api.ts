import type {
  AuthResponse,
  CreateTaskRequest,
  SigninRequest,
  SignupRequest,
  Task,
  UpdateTaskRequest,
} from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Custom error class for API errors
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Fetch wrapper with auth and 401 handling
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;

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

  if (response.status === 401) {
    useAuthStore.getState().signout();
    window.location.href = '/signin';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new ApiError(response.status, error.detail || 'An error occurred');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
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
};
