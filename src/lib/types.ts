export const TaskStatus = {
  TODO: 'todo',
  DONE: 'done',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const MAX_POSITION = 2147483647; // Max 32-bit signed integer

// User type
export interface User {
  id: string;
  email: string;
  full_name?: string;
}

// Task type
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Auth response from API
export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

// API request types
export interface SignupRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
}

export interface TaskNotification {
  id: string;
  task_id: string | null;
  title: string;
  message: string;
  read_at: string | null;
  sent_at: string | null;
}

export interface PaginatedNotifications {
  items: TaskNotification[];
  total: number;
  skip: number;
  limit: number;
}

// API error response
export interface ApiError {
  detail: string;
}
