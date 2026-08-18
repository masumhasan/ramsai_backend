import admin from 'firebase-admin';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let isFirebaseAdminInitialized = false;

export const initFirebaseAdmin = () => {
  if (isFirebaseAdminInitialized && getApps().length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'gocal-ai';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Unescape escaped newline characters if passed as string in env
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseAdminInitialized = true;
      console.log(`[FIREBASE] 🔥 Firebase Admin SDK initialized for project "${projectId}"`);
    } else {
      initializeApp({
        projectId,
      });
      isFirebaseAdminInitialized = true;
      console.log(`[FIREBASE] 🔥 Firebase Admin SDK initialized with default project "${projectId}"`);
    }
    return admin;
  } catch (error: any) {
    console.warn(`[FIREBASE WARN] ⚠️ Firebase Admin SDK initialization skipped or failed: ${error.message}`);
    return null;
  }
};

export const getFirebaseMessaging = (): Messaging | null => {
  if (getApps().length === 0) {
    initFirebaseAdmin();
  }
  if (getApps().length === 0) {
    return null;
  }
  try {
    return getMessaging();
  } catch (error: any) {
    console.warn(`[FIREBASE WARN] Messaging client error: ${error.message}`);
    return null;
  }
};
