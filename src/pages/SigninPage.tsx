import { signinSchema, type SigninFormData } from '@/lib/schemas';
import { ApiError, authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function SigninPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const signin = useAuthStore((state) => state.signin);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  useEffect(() => {
    const state = location.state as { email?: string; password?: string; signupSuccess?: boolean } | null;
    
    if (state?.signupSuccess) {
      setSuccess('Account created successfully! Please sign in to continue.');
      
      if (state.email && state.password) {
        reset({
          email: state.email,
          password: state.password,
        });
      }
      
      // Clear location state to prevent message from reappearing on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, reset, navigate]);

  const onSubmit = async (data: SigninFormData) => {
    try {
      setError(null);
      const response = await authApi.signin(data);
      signin(response.access_token, response.refresh_token, { email: data.email });
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
          <p className="text-slate-400 mt-2">Welcome back to Tasflou</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {success && (
            <div className="p-3 bg-emerald-900/30 border border-emerald-700 rounded-lg">
              <p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}

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
