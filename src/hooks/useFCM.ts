import { app } from '@/lib/firebase';
import { notificationsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { useCallback, useEffect, useRef } from 'react';

// Module-level tracking to prevent redundant work across hook instances
const registeredTokens = new Set<string>();

export const useFCM = () => {
  const queryClient = useQueryClient();
  const isRegistering = useRef(false);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (!window.isSecureContext) {
      console.error('FCM - Notifications require a secure context (HTTPS or localhost). Current origin:', window.location.origin);
      return;
    }

    try {
      if (!(await isSupported())) return;
      const messaging = getMessaging(app);

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        if (!registration) {
          console.error('FCM - No active service worker found');
          return;
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
          } catch (error) {
            console.error('FCM - Error registering token:', error);
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

    // Listen for permission changes
    let permissionStatus: PermissionStatus | undefined;
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then((status) => {
        permissionStatus = status;
        status.onchange = () => {
          if (status.state === 'granted') {
            requestPermission();
          }
        };
      }).catch(err => {
        console.warn('FCM - Permissions API not fully supported:', err);
      });
    }

    let unsubscribe: (() => void) | undefined;

    const setupOnMessage = async () => {
      try {
        if (!(await isSupported())) return;
        const messaging = getMessaging(app);

        unsubscribe = onMessage(messaging, async (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          if (payload.notification) {
            // Only show the notification if this tab is visible or focused.
            if (document.visibilityState === 'visible' || document.hasFocus()) {
              const registration = await navigator.serviceWorker.ready;
              const notificationId = payload.data?.notification_id;

              registration.showNotification(payload.notification.title!, {
                body: payload.notification.body,
                icon: '/pwa-192x192.png',
                data: payload.data,
                tag: notificationId, // Using a tag prevents duplicate notifications from showing
              });
            }
          }
        });
      } catch (error) {
        console.error('FCM - Error setting up onMessage:', error);
      }
    };

    setupOnMessage();

    return () => {
      if (unsubscribe) unsubscribe();
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [requestPermission, queryClient]);

  return { requestPermission };
};
