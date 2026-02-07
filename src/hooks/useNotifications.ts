import { getMessagingSafe } from '@/lib/firebase';
import { notificationsApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useEffect } from 'react';

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
  }, [isAuthenticated, requestPermission]);

  return { requestPermission };
};
