import { getPendingNotifications } from '@/lib/db';
import { getMessagingSafe } from '@/lib/firebase';
import { notificationsApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 0 }) => notificationsApi.getNotifications(pageParam as number, 20),
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    initialPageParam: 0,
    enabled: isAuthenticated,
  });

  const notifications = useMemo(() =>
    data?.pages.flatMap((page) => page.items) ?? [],
    [data]);

  const total = data?.pages[0]?.total ?? 0;

  const unreadCount = useMemo(() =>
    notifications.filter((n) => !n.read_at).length,
    [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Process pending notifications from IndexedDB
  useEffect(() => {
    if (isAuthenticated) {
      const processPending = async () => {
        try {
          const pendingIds = await getPendingNotifications();
          if (pendingIds.length > 0) {
            console.log('Processing items from storage:', pendingIds);
            for (const id of pendingIds) {
              await markAsReadMutation.mutateAsync(id);
            }
          }
        } catch (error) {
          console.error('Error processing pending notifications:', error);
        }
      };
      processPending();
    }
  }, [isAuthenticated, markAsReadMutation.mutateAsync]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (!window.isSecureContext) {
      console.error('Notifications require a secure context (HTTPS or localhost)');
      return;
    }

    try {
      const messaging = await getMessagingSafe();
      if (!messaging) return;

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        const token = await messaging.getToken(messaging.instance, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          console.log('FCM Token retrieved successfully');
          await notificationsApi.registerDevice(token, 'web');
        }
      }
    } catch (error) {
      console.error('FCM - Error during notification setup:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      requestPermission();

      let unsubscribe: (() => void) | undefined;

      const setupOnMessage = async () => {
        try {
          const messaging = await getMessagingSafe();
          if (messaging && messaging.onMessage) {
            unsubscribe = messaging.onMessage(messaging.instance, (payload: any) => {
              console.log('Foreground message received:', payload);
              // Refresh query when a new message arrives
              refetch();

              if (payload.notification) {
                new Notification(payload.notification.title || 'New Notification', {
                  body: payload.notification.body,
                  icon: '/pwa-192x192.png',
                });
              }
            });
          }
        } catch (error) {
          console.error('FCM - Error setting up onMessage:', error);
        }
      };

      setupOnMessage();

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated, requestPermission, refetch]);

  return {
    notifications,
    loading: isLoading || isFetchingNextPage,
    total,
    unreadCount,
    hasNextPage,
    fetchNextPage,
    markAsRead: markAsReadMutation.mutate,
    requestPermission
  };
};
