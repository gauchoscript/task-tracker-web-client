import { signinSchema, type SigninFormData } from '@/lib/schemas';
import { ApiError, authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

export function SigninPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const signin = useAuthStore((state) => state.signin);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      setError(null);
      const response = await authApi.signin(data);
      signin(response.access_token);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-sm p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="text-slate-400 mt-2">Welcome back to TaskFlow</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className="input-field"
              autoComplete="email"
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="input-field"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-6"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
