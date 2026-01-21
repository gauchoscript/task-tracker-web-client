export enum TaskStatus {
  TODO = 'todo',
  DONE = 'done',
}

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
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Auth response from API
export interface AuthResponse {
  access_token: string;
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
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// API error response
export interface ApiError {
  detail: string;
}
