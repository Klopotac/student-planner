import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
  throw new Error("Missing Firebase admin credentials");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

export const adminDb = getFirestore(adminApp);
