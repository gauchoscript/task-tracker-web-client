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
      console.error('FCM - Notifications require a secure context (HTTPS or localhost). Current origin:', window.location.origin);
      return;
    }

    try {
      if (!(await isSupported())) return;
      const messaging = getMessaging(app);

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        alert('FCM: Permission granted');

        // Helper to get active registration
        const getActiveRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
          for (let i = 0; i < 10; i++) { // Try for 5 seconds
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              if (reg.active) return reg;

              // If we have an installing or waiting worker, wait for it to activate
              const worker = reg.installing || reg.waiting;
              if (worker) {
                alert(`FCM: Worker found in state: ${worker.state}. Waiting for activation...`);
                await new Promise<void>((resolve) => {
                  worker.addEventListener('statechange', () => {
                    if (worker.state === 'activated') resolve();
                  });
                  // Safety timeout for the state change
                  setTimeout(resolve, 2000);
                });
                if (reg.active) return reg;
              }
            }
            alert(`FCM: No active registration yet (attempt ${i + 1}/10), retrying in 500ms...`);
            await new Promise(r => setTimeout(r, 500));
          }
          return null;
        };

        const registration = await getActiveRegistration();

        if (!registration) {
          alert('FCM: Failed to get active service worker registration after polling');
          return;
        }

        alert('FCM: Active registration found, getting token...');
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        alert(`FCM: Token retrieved: ${token ? 'YES' : 'NO'}`);
        if (token && !registeredTokens.has(token) && !isRegistering.current) {
          isRegistering.current = true;
          alert('FCM: Registering token');
          try {
            await notificationsApi.registerDevice(token, 'web');
            registeredTokens.add(token);
            alert('FCM: Token registered successfully');
          } finally {
            isRegistering.current = false;
          }
        }
      }
    } catch (error) {
      console.error('FCM - Error during notification setup:', error);
      alert(`FCM: Error during setup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);


  useEffect(() => {
    requestPermission();

    // Listen for permission changes (supported in most modern browsers)
    let permissionStatus: PermissionStatus | undefined;
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then((status) => {
        permissionStatus = status;
        status.onchange = () => {
          console.log('FCM - Permission status changed to:', status.state);
          if (status.state === 'granted') {
            alert('FCM: Permission granted detected!');
            requestPermission();
          }
        };
      }).catch(err => {
        console.warn('FCM - Permissions API not fully supported or error:', err);
      });
    }

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
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [requestPermission, queryClient]);

  return { requestPermission };
};
