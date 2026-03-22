import { getPendingNotifications } from '@/lib/db';
import { notificationsApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
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
  const unreadCount = data?.pages[0]?.unread ?? 0;

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, read_source = 'web_client' }: { id: string; read_source?: string }) =>
      notificationsApi.markAsRead(id, read_source),
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
            for (const id of pendingIds) {
              await markAsReadMutation.mutateAsync({ id, read_source: 'web_push' });
            }
          }
        } catch (error) {
          console.error('Error processing pending notifications:', error);
        }
      };
      processPending();
    }
  }, [isAuthenticated, markAsReadMutation]);

  return {
    notifications,
    loading: isLoading || isFetchingNextPage,
    total,
    unreadCount,
    hasNextPage,
    fetchNextPage,
    markAsRead: (id: string, read_source?: string) => markAsReadMutation.mutate({ id, read_source }),
  };
};

