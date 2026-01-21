import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditTaskPage } from '../pages/EditTaskPage';
import { HomePage } from '../pages/HomePage';
import { NewTaskPage } from '../pages/NewTaskPage';
import { useAuthStore } from '../stores/authStore';
import { fireEvent, render, screen, waitFor } from '../test-utils';

describe('Task Management Flows', () => {
    beforeEach(() => {
        // Authenticate the user for task operations
        useAuthStore.setState({ token: 'fake-token', user: { id: '1', email: 'test@example.com' } });
    });

    it('renders list of tasks', async () => {
        render(<HomePage />);
        // MSW returns 2 tasks: Test Task 1, Test Task 2
        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
            expect(screen.getByText('Test Task 2')).toBeInTheDocument();
        });
    });

    it('allows creating a new task', async () => {
        render(
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tasks/new" element={<NewTaskPage />} />
            </Routes>
        );

        // Click create task button (FAB)
        const createButton = screen.getByRole('button', { name: /create new task/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /new task/i })).toBeInTheDocument();
        });

        const titleInput = screen.getByLabelText(/title/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const submitButton = screen.getByRole('button', { name: /create/i }); 

        fireEvent.change(titleInput, { target: { value: 'Fresh Task' } });
        fireEvent.change(descriptionInput, { target: { value: 'Fresh Description' } });
        fireEvent.click(submitButton);

        // Verify redirect to home
        await waitFor(() => {
             expect(screen.getByText('Fresh Task')).toBeInTheDocument();
        });
    });

    it('allows editing a task', async () => {
        render(
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
            </Routes>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
        });

        const editButtons = screen.getAllByRole('button', { name: /edit task/i });
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /edit task/i })).toBeInTheDocument();
        });

        const titleInput = screen.getByLabelText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'Updated Task Title' } });
        
        const submitButton = screen.getByRole('button', { name: /update/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Updated Task Title')).toBeInTheDocument();
        });
    });

    it('allows deleting a task', async () => {
         render(<HomePage />);
         
         const confirmSpy = vi.spyOn(window, 'confirm');
         confirmSpy.mockImplementation(() => true);

         await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
         });

         const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
         fireEvent.click(deleteButtons[0]);

         await waitFor(() => {
            expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument(); 
         });

         confirmSpy.mockRestore();
    });
});
