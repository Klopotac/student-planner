import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_ADMIN_CREDENTIALS;

    if (!serviceAccount) {
      throw new Error("Missing FIREBASE_ADMIN_CREDENTIALS environment variable.");
    }

    const parsedCredentials = JSON.parse(serviceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(parsedCredentials),
    });

    console.log("🔥 Firebase Admin Initialized");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Firebase Admin SDK failed to initialize:", error.message);
    } else {
      console.error("❌ An unknown error occurred while initializing Firebase Admin SDK.");
    }
  }
}

export default admin;
