let firebaseAdmin: any;
if (process.env.USE_ADMIN_STUB) {
  firebaseAdmin = await import('./admin-stub.js');
} else {
  try {
    firebaseAdmin = await import('firebase-admin');
  } catch {
    firebaseAdmin = await import('./admin-stub.js');
  }
}

import dotenv from 'dotenv';
dotenv.config();

const admin = firebaseAdmin.default ?? firebaseAdmin;

const projectId =
  process.env.GCP_PROJECT ||
  process.env.PROJECT_ID   ||
  'mail-sender-1aafa';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

export default admin;