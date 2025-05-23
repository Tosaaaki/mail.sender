import * as firebaseAdmin from 'firebase-admin';

/** Firebase Admin singleton (Node 20 + ESM) */
const admin = (firebaseAdmin as any).default ?? firebaseAdmin;

if (!admin.apps.length) {
  admin.initializeApp();
}

export default admin;

