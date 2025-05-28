import * as firebaseAdmin from 'firebase-admin';
import adminStub from './admin-stub.js';
import dotenv from 'dotenv';

dotenv.config();

const adminModule: any = process.env.USE_ADMIN_STUB ? adminStub : firebaseAdmin;
const admin = (adminModule as any).default ?? adminModule;

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