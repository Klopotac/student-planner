import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string // Update this to match Vercel
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("🔥 Firebase Admin Initialized");
  } catch (error) {
    console.error("❌ Firebase Admin SDK failed to initialize:", error);
  }
}

export default admin;
