import { z } from 'zod';
import { TaskStatus } from './types';

// Signin form schema
export const signinSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type SigninFormData = z.infer<typeof signinSchema>;

// Signup form schema
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  full_name: z
    .string()
    .optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Task form schema
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  status: z
    .nativeEnum(TaskStatus)
    .optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
