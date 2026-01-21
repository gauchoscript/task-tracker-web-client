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

  it('allows user to sign up and redirects to signin', async () => {
    // Signup redirects to '/' on success.
    render(
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<div>Home Page Reached</div>} />
      </Routes>,
      { route: '/signup' }
    );

    const emailInput = screen.getByLabelText(/email/i);
    // Adjust selector based on actual input labelling. Using placeholder or label text.
    // If usage of react-hook-form resolvers with placeholders:
    // screen.getByPlaceholderText(/email/i) might be needed if labels aren't properly associated.
    // Ideally code is accessible.
    
    // Assuming standard labels
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Use getByLabelText with regex for robustness
    const passwordInput = screen.getByLabelText(/^password/i); 
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // There is no confirm password field in the current signup form.
    // const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    // fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Signup redirects to Home ('/') after auto-login
      expect(screen.getByText('Home Page Reached')).toBeInTheDocument();
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
