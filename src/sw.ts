/// <reference lib="webworker" />
import { getMessaging } from 'firebase/messaging/sw';
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { recordClickedNotification } from './lib/db';
import { app } from './lib/firebase';

declare let self: ServiceWorkerGlobalScope;

// --- 1. INITIAL EVALUATION: REGISTER ALL LISTENERS IMMEDIATELY ---
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

clientsClaim();

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification.data?.FCM_MSG?.data;
  const notificationId = data?.notification_id;
  const taskId = data?.task_id;
  const baseUrl = self.registration.scope;
  const targetUrl = taskId ? `${baseUrl}tasks/${taskId}` : baseUrl;

  notification.close();

  if (notificationId) {
    event.waitUntil(recordClickedNotification(notificationId));
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        return client.navigate(targetUrl).then((c) => c?.focus());
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// --- 2. WORKBOX CONFIG ---
precacheAndRoute(self.__WB_MANIFEST);

// --- 3. FIREBASE INITIALIZATION ---
getMessaging(app);
