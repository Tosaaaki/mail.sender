import * as functions from 'firebase-functions';

const apiKey = process.env.FIREBASE_API_KEY || '';

export const login = functions.https.onRequest(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: 'missing credentials' });
    return;
  }
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await resp.json();
    if (data.idToken) {
      res.json({ token: data.idToken });
    } else {
      res.status(400).json({ error: data.error });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});
