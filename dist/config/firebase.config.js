"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseMessaging = exports.initFirebaseAdmin = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
let isFirebaseAdminInitialized = false;
const initFirebaseAdmin = () => {
    if (isFirebaseAdminInitialized && (0, app_1.getApps)().length > 0) {
        return firebase_admin_1.default;
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
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            isFirebaseAdminInitialized = true;
            console.log(`[FIREBASE] 🔥 Firebase Admin SDK initialized for project "${projectId}"`);
        }
        else {
            (0, app_1.initializeApp)({
                projectId,
            });
            isFirebaseAdminInitialized = true;
            console.log(`[FIREBASE] 🔥 Firebase Admin SDK initialized with default project "${projectId}"`);
        }
        return firebase_admin_1.default;
    }
    catch (error) {
        console.warn(`[FIREBASE WARN] ⚠️ Firebase Admin SDK initialization skipped or failed: ${error.message}`);
        return null;
    }
};
exports.initFirebaseAdmin = initFirebaseAdmin;
const getFirebaseMessaging = () => {
    if ((0, app_1.getApps)().length === 0) {
        (0, exports.initFirebaseAdmin)();
    }
    if ((0, app_1.getApps)().length === 0) {
        return null;
    }
    try {
        return (0, messaging_1.getMessaging)();
    }
    catch (error) {
        console.warn(`[FIREBASE WARN] Messaging client error: ${error.message}`);
        return null;
    }
};
exports.getFirebaseMessaging = getFirebaseMessaging;
