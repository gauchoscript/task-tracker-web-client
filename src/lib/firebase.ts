import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

/**
 * Safely gets the Firebase Messaging instance and utilities after checking for support.
 * This works in both the main application and the Service Worker.
 */
export const getMessagingSafe = async () => {
  // 1. Pre-check: Environment support
  const isSW = typeof window === 'undefined';

  if (!isSW) {
    if (!window.isSecureContext) {
      console.warn('FCM: Not in a secure context (HTTPS/localhost). Messaging skipped.');
      return null;
    }
    if (!('serviceWorker' in navigator)) {
      console.warn('FCM: Service Workers not supported. Messaging skipped.');
      return null;
    }
  }

  try {
    // 2. Dynamic import to avoid top-level SDK initialization
    const messagingModule = isSW
      ? await import('firebase/messaging/sw')
      : await import('firebase/messaging');

    // 3. SDK-level support check
    const supported = await messagingModule.isSupported();
    if (supported) {
      return {
        instance: messagingModule.getMessaging(app),
        getToken: (messagingModule as any).getToken,
        onMessage: (messagingModule as any).onMessage,
        onBackgroundMessage: (messagingModule as any).onBackgroundMessage,
      };
    }
    return null;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};
