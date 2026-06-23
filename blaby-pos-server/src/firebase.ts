import { firebaseConfig } from "./firebase_config";

const admin = require("firebase-admin");
// admin.initializeApp({
//   credential: admin.credential.cert(firebaseConfig),
// });

module.exports = admin;
