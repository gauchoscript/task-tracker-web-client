/// <reference lib="webworker" />
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { recordClickedNotification } from './lib/db';
import { app } from './lib/firebase';

declare let self: ServiceWorkerGlobalScope;

// --- 1. INITIAL EVALUATION: REGISTER ALL LISTENERS IMMEDIATELY ---
self.addEventListener('install', () => {
  console.log('[sw.ts] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[sw.ts] Activate');
  event.waitUntil(self.clients.claim());
});

clientsClaim();

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const notificationId = notification.data?.notification_id;

  notification.close();

  if (notificationId) {
    event.waitUntil(recordClickedNotification(notificationId));
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return self.clients.openWindow('/');
    })
  );
});

// --- 2. WORKBOX CONFIG ---
precacheAndRoute(self.__WB_MANIFEST);

// --- 3. FIREBASE INITIALIZATION ---
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  if (payload.notification) {
    const notificationTitle = payload.notification.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/pwa-192x192.png',
      data: payload.data, // Preserve all data including notification_id
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
