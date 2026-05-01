import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationList } from '../components/NotificationList';
import { notificationsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { fireEvent, render, screen, waitFor } from '../test-utils';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock IndexedDB utility
vi.mock('../lib/db', () => ({
    getPendingNotifications: vi.fn().mockResolvedValue([]),
    recordClickedNotification: vi.fn().mockResolvedValue(undefined),
    initDB: vi.fn().mockResolvedValue({}),
}));

describe('Notification List', () => {
    beforeEach(() => {
        // Authenticate the user
        useAuthStore.setState({ 
            token: 'fake-token', 
            user: { email: 'test@example.com' },
            isAuthenticated: true 
        });
        mockNavigate.mockClear();
        vi.clearAllMocks();
    });

    it('renders notifications and handles click correctly', async () => {
        const markAsReadSpy = vi.spyOn(notificationsApi, 'markAsRead');
        
        render(<NotificationList />);

        // Click on the bell to open dropdown
        const bellButton = screen.getByLabelText(/notifications/i);
        fireEvent.click(bellButton);

        // Wait for notifications to load and appear
        await waitFor(() => {
            expect(screen.getByTestId('notification-item-n1')).toBeInTheDocument();
            expect(screen.getByTestId('notification-item-n2')).toBeInTheDocument();
        });

        // Click on the unread notification
        const unreadItem = screen.getByTestId('notification-item-n1');
        fireEvent.click(unreadItem);

        // Verify navigation and markAsRead
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/tasks/1');
            expect(markAsReadSpy).toHaveBeenCalledWith('n1', 'web_client');
        });

        // Verify dropdown is closed
        await waitFor(() => {
            expect(screen.queryByTestId('notification-item-n1')).not.toBeInTheDocument();
        });

        markAsReadSpy.mockRestore();
    });

    it('does not call markAsRead for already read notifications', async () => {
        const markAsReadSpy = vi.spyOn(notificationsApi, 'markAsRead');
        
        render(<NotificationList />);

        // Click on the bell to open dropdown
        const bellButton = screen.getByLabelText(/notifications/i);
        fireEvent.click(bellButton);

        // Wait for notifications to load
        await waitFor(() => {
            expect(screen.getByTestId('notification-item-n2')).toBeInTheDocument();
        });

        // Click on the read notification
        const readItem = screen.getByTestId('notification-item-n2');
        fireEvent.click(readItem);

        // Verify navigation to task 2
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/tasks/2');
        });

        // Verify markAsRead was NOT called
        expect(markAsReadSpy).not.toHaveBeenCalled();

        markAsReadSpy.mockRestore();
    });

    it('marks as read when clicking the dot without navigating', async () => {
        const markAsReadSpy = vi.spyOn(notificationsApi, 'markAsRead');
        
        render(<NotificationList />);

        // Click on the bell to open dropdown
        const bellButton = screen.getByLabelText(/notifications/i);
        fireEvent.click(bellButton);

        // Wait for notifications to load
        await waitFor(() => {
            expect(screen.getByTestId('notification-dot-n1')).toBeInTheDocument();
        });

        // Click on the unread dot
        const unreadDot = screen.getByTestId('notification-dot-n1');
        fireEvent.click(unreadDot);

        // Verify markAsRead was called
        await waitFor(() => {
            expect(markAsReadSpy).toHaveBeenCalledWith('n1', 'web_client');
        });

        // Verify navigation was NOT called
        expect(mockNavigate).not.toHaveBeenCalled();

        markAsReadSpy.mockRestore();
    });

    it('marks all as read when clicking the mark all read button', async () => {
        const markAllAsReadSpy = vi.spyOn(notificationsApi, 'markAllAsRead');
        
        render(<NotificationList />);

        // Click on the bell to open dropdown
        const bellButton = screen.getByLabelText(/notifications/i);
        fireEvent.click(bellButton);

        // Wait for notifications to load
        await waitFor(() => {
            expect(screen.getByText(/mark all read/i)).toBeInTheDocument();
        });

        // Click on the mark all read button
        const markAllButton = screen.getByText(/mark all read/i);
        fireEvent.click(markAllButton);

        // Verify markAllAsRead was called
        await waitFor(() => {
            expect(markAllAsReadSpy).toHaveBeenCalledWith('web_client');
        });

        markAllAsReadSpy.mockRestore();
    });
});
