import * as functions from 'firebase-functions';
import admin from './admin.js';

let google: any;
try {
  ({ google } = await import('googleapis'));
} catch {
  ({ google } = await import('./googleapis-stub.js'));
}

export const sheetPuller = functions.https.onRequest(async (_req: any, res: any) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.SHEET_ID;
  // シート名と取得範囲は環境変数から取得する
  const sheetName = process.env.SHEET_NAME;
  const sheetRange = process.env.SHEET_RANGE || 'A:G';
  if (!apiKey || !sheetId || !sheetName) {
    res.status(500).send('Missing environment configuration');
    return;
  }
  try {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!${sheetRange}`,
    });
    const values = result.data.values || [];
    for (const row of values) {
      const id = row[0];
      if (!id) continue;
      await admin.firestore().doc(`mailData/${id}`).set({
        B: row[1] || '',
        C: row[2] || '',
        D: row[3] || '',
        E: row[4] || '',
        F: row[5] || '',
        G: row[6] || '',
      });
    }
    res.json({ count: values.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});
