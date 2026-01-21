import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { EditTaskPage } from '@/pages/EditTaskPage';
import { HomePage } from '@/pages/HomePage';
import { NewTaskPage } from '@/pages/NewTaskPage';
import { SigninPage } from '@/pages/SigninPage';
import { SignupPage } from '@/pages/SignupPage';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tasks/new" element={<NewTaskPage />} />
              <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
