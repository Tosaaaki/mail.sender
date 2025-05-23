let firebaseAdmin: any;
if (process.env.USE_ADMIN_STUB) {
  firebaseAdmin = await import('./admin-stub.js');
} else {
  try {
    firebaseAdmin = await import('firebase-admin');
  } catch (err) {
    firebaseAdmin = await import('./admin-stub.js');
  }
}

const admin = firebaseAdmin.default ?? firebaseAdmin;

if (!admin.apps.length) {
  admin.initializeApp();
}

export default admin;
