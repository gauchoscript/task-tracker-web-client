import { messaging } from '@/lib/firebase';
import { notificationsApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { getToken, onMessage } from 'firebase/messaging';
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
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
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

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          new Notification(payload.notification.title || 'New Notification', {
            body: payload.notification.body,
            icon: '/pwa-192x192.png',
          });
        }
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated, requestPermission]);

  return { requestPermission };
};
