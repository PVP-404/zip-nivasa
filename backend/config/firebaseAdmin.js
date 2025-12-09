import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const serviceAccount = require("./firebase-service-account.json");

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin Initialized (Phone Auth + FCM Ready)");
}

export default admin;
