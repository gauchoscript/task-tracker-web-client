import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import { HomePage } from '../pages/HomePage';
import { SigninPage } from '../pages/SigninPage';
import { SignupPage } from '../pages/SignupPage';
import { useAuthStore } from '../stores/authStore';
import { fireEvent, render, screen, waitFor } from '../test-utils';

const apiUrl = import.meta.env.VITE_API_URL;

describe('Authentication Flows', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  });

  it('renders signin page initially', () => {
    render(<SigninPage />);
    expect(screen.getByRole('heading', { level: 1, name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to sign up and redirects to signin with success message', async () => {
    render(
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
      </Routes>,
      { route: '/signup' }
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should redirect to /signin and show success message
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
      
      // Should also have the form pre-filled
      expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
      expect(screen.getByLabelText(/^password/i)).toHaveValue('password123');
    });
  });

  it('allows user to sign in and redirects to home', async () => {
    // Mock successful signin response is handled by MSW handlers.
    render(
      <Routes>
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/" element={<div>Home Page Reached</div>} />
      </Routes>,
      { route: '/signin' }
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Home Page Reached')).toBeInTheDocument();
      const state = useAuthStore.getState();
      expect(state.user?.email).toBe('test@example.com');
      expect(state.refreshToken).toBe('fake-refresh');
    });
  });

  it('automatically refreshes token when a request fails with 401', async () => {
    // 1. Setup authenticated state with a "stale" token
    useAuthStore.setState({
      token: 'stale-token',
      refreshToken: 'fake-refresh',
      user: { email: 'test@example.com' },
      isAuthenticated: true
    });

    // 2. Mock 401 for the first request, then success
    let failRequested = true;
    server.use(
      http.get(`${apiUrl}/tasks`, () => {
        if (failRequested) {
          failRequested = false;
          return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json([{
          id: '1',
          title: 'Refreshed Task',
          status: 'todo',
          position: 1000,
          user_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      })
    );

    render(<HomePage />);

    // 3. Verify it eventually shows the data (after refresh and retry)
    await waitFor(() => {
      expect(screen.getByText('Refreshed Task')).toBeInTheDocument();
    });

    // 4. Verify store has new token
    const state = useAuthStore.getState();
    expect(state.token).toBe('new-fake-token');
  });
});
