import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

export const assignUserId = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const counterRef = db.doc('counters/userId');
  const userRef = db.doc(`users/${user.uid}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    let next = 1;
    if (snap.exists) {
      const data = snap.data();
      if (data && typeof data.value === 'number') {
        next = data.value + 1;
      }
    }
    tx.set(counterRef, { value: next }, { merge: true });
    tx.set(userRef, {
      userId: next,
      name: user.displayName || '',
      email: user.email || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  });
});
