import { app } from '@/lib/firebase';
import { notificationsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { useCallback, useEffect, useRef } from 'react';

// Module-level set to track tokens registered in the current session
const registeredTokens = new Set<string>();

export const useFCM = () => {
  const queryClient = useQueryClient();
  const isRegistering = useRef(false);

  const requestPermission = useCallback(async () => {
    console.log('FCM - requestPermission called');
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (!window.isSecureContext) {
      console.error('Notifications require a secure context (HTTPS or localhost)');
      return;
    }

    try {
      if (!(await isSupported())) return;
      const messaging = getMessaging(app);

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Use getRegistration() for better reliability
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.ready;
        }

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token && !registeredTokens.has(token) && !isRegistering.current) {
          isRegistering.current = true;
          try {
            await notificationsApi.registerDevice(token, 'web');
            registeredTokens.add(token);
            console.log('FCM Token registered successfully');
          } finally {
            isRegistering.current = false;
          }
        }
      }
    } catch (error) {
      console.error('FCM - Error during notification setup:', error);
    }
  }, []);


  useEffect(() => {
    requestPermission();

    let unsubscribe: (() => void) | undefined;

    const setupOnMessage = async () => {
      try {
        if (!(await isSupported())) return;
        const messaging = getMessaging(app);

        unsubscribe = onMessage(messaging, (payload: any) => {
          console.log('Foreground message received:', payload);
          // Invalidate notifications query when a new message arrives
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          if (payload.notification) {
            new Notification(payload.notification.title || 'New Notification', {
              body: payload.notification.body,
              icon: '/pwa-192x192.png',
            });
          }
        });
      } catch (error) {
        console.error('FCM - Error setting up onMessage:', error);
      }
    };

    console.log('FCM - Setting up onMessage');

    setupOnMessage();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [requestPermission, queryClient]);

  return { requestPermission };
};
