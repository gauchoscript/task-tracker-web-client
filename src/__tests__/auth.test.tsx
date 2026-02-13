import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { SigninPage } from '../pages/SigninPage';
import { SignupPage } from '../pages/SignupPage';
import { useAuthStore } from '../stores/authStore';
import { fireEvent, render, screen, waitFor } from '../test-utils';

describe('Authentication Flows', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null });
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
    });
  });
});
