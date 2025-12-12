// import admin from "firebase-admin";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);

// const serviceAccount = require("./firebase-service-account.json");

// // Initialize Firebase Admin only once
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });

//   console.log("Firebase Admin Initialized (Phone Auth + FCM Ready)");
// }

// export default admin;

//for deployment 
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Default path where Render stores secret files
const defaultServiceAccountPath = "/etc/secrets/firebase-service-account.json";

// Allow custom path via environment variable for local development
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || defaultServiceAccountPath;

let serviceAccount = null;

try {
  const fileContent = fs.readFileSync(path.resolve(serviceAccountPath), "utf8");
  serviceAccount = JSON.parse(fileContent);
  console.log("Firebase service account loaded successfully.");
} catch (error) {
  console.error("Failed to read Firebase service account file:", error);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin Initialized (Phone Auth + FCM Ready)");
}

export default admin;
