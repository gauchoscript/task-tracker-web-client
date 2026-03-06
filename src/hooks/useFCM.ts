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
      console.warn('FCM - This browser does not support notifications');
      return;
    }

    if (!window.isSecureContext) {
      console.error('FCM - Notifications require a secure context (HTTPS or localhost). Current origin:', window.location.origin);
      return;
    }

    try {
      console.log('FCM - Checking isSupported...');
      const supported = await isSupported();
      console.log('FCM - isSupported result:', supported);
      if (!supported) {
        console.warn('FCM - isSupported returned false');
        return;
      }
      const messaging = getMessaging(app);
      console.log('FCM - Messaging SDK initialized');

      console.log('FCM - Current permission status:', Notification.permission);
      const permission = await Notification.requestPermission();
      console.log('FCM - Permission request result:', permission);

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        console.log('FCM Token retrieved:', token ? 'YES' : 'NO');
        if (token) {
          console.log('FCM Token Value:', token);
          console.log('VAPID Key used:', import.meta.env.VITE_FIREBASE_VAPID_KEY);
        }

        if (token && !registeredTokens.has(token) && !isRegistering.current) {
          isRegistering.current = true;
          try {
            console.log('FCM Token retrieved successfully, registering to backend...');
            await notificationsApi.registerDevice(token, 'web');
            registeredTokens.add(token);
            console.log('FCM Token registered successfully in backend');
          } catch (regError) {
            console.error('FCM - Error registering token in backend:', regError);
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
