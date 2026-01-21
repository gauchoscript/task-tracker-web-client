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

     it('allows filtering tasks by status', async () => {
         render(<HomePage />);
         
         // Wait for initial tasks to load
         await waitFor(() => {
             expect(screen.getByText('Test Task 1')).toBeInTheDocument();
             expect(screen.getByText('Test Task 2')).toBeInTheDocument();
             expect(screen.getByText('Test Task 3')).toBeInTheDocument();
         });

         // Verify filter buttons are present
         const allButton = screen.getByRole('button', { name: /^all$/i });
         const todoButton = screen.getByRole('button', { name: /^todo$/i });
         const doneButton = screen.getByRole('button', { name: /^done$/i });

         expect(allButton).toBeInTheDocument();
         expect(todoButton).toBeInTheDocument();
         expect(doneButton).toBeInTheDocument();

         // Click TODO filter
         fireEvent.click(todoButton);

         // Wait for filtered results (only TODO tasks)
         await waitFor(() => {
             expect(screen.getByText('Test Task 1')).toBeInTheDocument();
             expect(screen.queryByText('Test Task 2')).toBeInTheDocument();
             expect(screen.queryByText('Test Task 3')).not.toBeInTheDocument();
         });

         // Click DONE filter
         fireEvent.click(doneButton);

         // Wait for filtered results (only DONE tasks)
         await waitFor(() => {
             expect(screen.getByText('Test Task 3')).toBeInTheDocument();
             expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
             expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
         });

         // Click All filter
         fireEvent.click(allButton);

         // Wait for all tasks to show again
         await waitFor(() => {
             expect(screen.getByText('Test Task 1')).toBeInTheDocument();
             expect(screen.getByText('Test Task 2')).toBeInTheDocument();
             expect(screen.getByText('Test Task 3')).toBeInTheDocument();
         });
     });
});
