// backend/config/firebaseAdmin.js
import admin from "firebase-admin";
import { createRequire } from "module";

// Allows us to use require() in ES Modules
const require = createRequire(import.meta.url);

// Load the service account JSON
const serviceAccount = require("./firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
