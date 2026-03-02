import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskStatus } from '../lib/types';
import { EditTaskPage } from '../pages/EditTaskPage';
import { HomePage } from '../pages/HomePage';
import { NewTaskPage } from '../pages/NewTaskPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { useAuthStore } from '../stores/authStore';
import { fireEvent, render, screen, waitFor } from '../test-utils';

describe('Task Management Flows', () => {
    beforeEach(() => {
        // Authenticate the user for task operations
        useAuthStore.setState({ token: 'fake-token', user: { email: 'test@example.com' } });
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

    it('allows editing a task status', async () => {
        render(
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
            </Routes>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
        });

        // Click Edit for Test Task 1 (which is TODO in mock handlers)
        const editButtons = screen.getAllByRole('button', { name: /edit task/i });
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /edit task/i })).toBeInTheDocument();
        });

        const statusSelect = screen.getByLabelText(/status/i);
        expect(statusSelect).toHaveValue(TaskStatus.TODO);

        fireEvent.change(statusSelect, { target: { value: TaskStatus.DONE } });
        
        const submitButton = screen.getByRole('button', { name: /update/i });
        fireEvent.click(submitButton);

        // After update, redirected to home. 
        // We can verify it's moved to done by clicking the DONE filter and checking it's there.
        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
        });

        const doneButton = screen.getByRole('button', { name: /^done$/i });
        fireEvent.click(doneButton);

        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
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
         
         // Wait for initial tasks to load (default is now TODO)
         await waitFor(() => {
             expect(screen.getByText('Test Task 1')).toBeInTheDocument();
             expect(screen.getByText('Test Task 2')).toBeInTheDocument();
             expect(screen.queryByText('Test Task 3')).not.toBeInTheDocument();
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

    it('allows creating and editing a task with a due date', async () => {
        render(
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tasks/new" element={<NewTaskPage />} />
                <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
            </Routes>
        );

        // 1. Create task with due date
        const createButton = screen.getByRole('button', { name: /create new task/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /new task/i })).toBeInTheDocument();
        });

        const titleInput = screen.getByLabelText(/title/i);
        const dueDateInput = screen.getByLabelText(/due date/i);
        const submitButton = screen.getByRole('button', { name: /create/i });

        fireEvent.change(titleInput, { target: { value: 'Dated Task' } });
        fireEvent.change(dueDateInput, { target: { value: '2026-03-01' } });
        fireEvent.click(submitButton);

        // Verify it shows up on home with formatted date
        await waitFor(() => {
            expect(screen.getByText('Dated Task')).toBeInTheDocument();
            // The formatting in TaskItem is locale-dependent, but Mar 1, 2026 should be part of it
            expect(screen.getByText(/March 1/i)).toBeInTheDocument();
        });

        // 2. Edit the task
        const editButtons = screen.getAllByRole('button', { name: /edit task/i });
        // The new task might be at the end or at the beginning depending on how getTasks returns it.
        // In our mock handlers, it's pushed to the end.
        fireEvent.click(editButtons[editButtons.length - 1]);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /edit task/i })).toBeInTheDocument();
        });

        const editDueDateInput = screen.getByLabelText(/due date/i);
        expect(editDueDateInput).toHaveValue('2026-03-01');

        fireEvent.change(editDueDateInput, { target: { value: '2026-04-01' } });
        const updateButton = screen.getByRole('button', { name: /update/i });
        fireEvent.click(updateButton);

        // Verify updated date on home
        await waitFor(() => {
            expect(screen.getByText('Dated Task')).toBeInTheDocument();
            expect(screen.getByText(/April 1/i)).toBeInTheDocument();
        });
    });

    it('navigates to task detail view and shows correct data', async () => {
        render(
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
            </Routes>
        );

        // Wait for tasks to load
        await waitFor(() => {
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
        });

        // Click on the task body to navigate to detail view
        // Task body is the first min-w-0 div in TaskItem
        const taskTitle = screen.getByText('Test Task 1');
        fireEvent.click(taskTitle);

        // Verify navigation to detail view
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1, name: /test task 1/i })).toBeInTheDocument();
            expect(screen.getByText('Description 1')).toBeInTheDocument();
            expect(screen.getByText('Back to List')).toBeInTheDocument();
        });

        // Test status toggle from detail view
        const toggleButton = screen.getByLabelText(/mark as done/i);
        fireEvent.click(toggleButton);

        // Should now show as completed
        await waitFor(() => {
            expect(screen.getByText('done')).toBeInTheDocument();
            expect(screen.queryByLabelText(/mark as done/i)).not.toBeInTheDocument();
            expect(screen.getByLabelText(/mark as todo/i)).toBeInTheDocument();
        });
        
        // Go back to list
        const backButton = screen.getByText(/back to list/i);
        fireEvent.click(backButton);

        // Verify we are back on home and task is still Test Task 1
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /your tasks/i })).toBeInTheDocument();
            expect(screen.getByText('Test Task 1')).toBeInTheDocument();
        });
    });
});
