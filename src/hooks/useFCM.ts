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
        alert('FCM: Permission granted. Searching for Service Worker...');

        const getActiveRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
          // Try for up to 30 seconds (60 * 500ms)
          for (let i = 0; i < 60; i++) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              if (reg.active) return reg;

              const worker = reg.installing || reg.waiting;
              if (worker) {
                console.log(`FCM: Worker state: ${worker.state}`);
                if (worker.state === 'activated') return reg;

                // Wait for state change if it's currently installing or waiting
                await new Promise<void>((resolve) => {
                  const stateChangeHandler = () => {
                    if (worker.state === 'activated' || worker.state === 'redundant') {
                      worker.removeEventListener('statechange', stateChangeHandler);
                      resolve();
                    }
                  };
                  worker.addEventListener('statechange', stateChangeHandler);
                  setTimeout(resolve, 2000);
                });
                if (reg.active) return reg;
              }
            }
            if (i % 5 === 0) { // Alert every 2.5 seconds to avoid spamming but keep user informed
              alert(`FCM: Waiting for SW (attempt ${i + 1}/60)...`);
            }
            await new Promise(r => setTimeout(r, 500));
          }
          return null;
        };

        const registration = await getActiveRegistration();

        if (!registration) {
          const regs = await navigator.serviceWorker.getRegistrations();
          alert(`FCM: Failed! Regs found: ${regs.length}. First state: ${regs[0]?.active ? 'active' : 'not active'}`);
          return;
        }

        alert('FCM: SW Active! Getting token...');
        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (token && !registeredTokens.has(token) && !isRegistering.current) {
            isRegistering.current = true;
            alert('FCM: Registering token with API...');
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
