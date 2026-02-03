import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);
