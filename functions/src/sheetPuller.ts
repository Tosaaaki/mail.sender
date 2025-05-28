import * as functions from 'firebase-functions';
import admin from './admin.js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();
// admin.initializeApp(); ← 削除します

let google: any;
async function loadGoogle() {
  if (!google) {
    try {
      ({ google } = await import('googleapis'));
    } catch {
      ({ google } = await import('./googleapis-stub.js'));
    }
  }
  return google;
}

const db = admin.firestore();

type ColumnMap = Record<string, number>;

function getFieldMap(): ColumnMap {
  const defaultMap: ColumnMap = {
    id: 3,             // 整理番号 (D 列)
    send_date: 0,      // A 列
    progress: 1,       // B 列
    manager_name: 2,   // C 列
    number: 3,         // D 列 (重複でも可)
    facility_name: 4,  // E 列
    operator_name: 5,  // F 列
    hp_url: 11,        // L 列 (e‑Mail / URL)
    email: 12,         // M 列 (HP URL または e‑mail 列)
  };
  const env = process.env.SHEET_FIELD_MAP;
  if (!env) return defaultMap;
  try {
    const parsed = JSON.parse(env);
    return { ...defaultMap, ...parsed };
  } catch {
    return defaultMap;
  }
}

type TemplateMap = Record<string, number>;
function getTemplateMap(): TemplateMap {
  const defaultMap: TemplateMap = {
    subject1: 0,
    body1: 1,
  };
  const env = process.env.TEMPLATE_FIELD_MAP;
  if (!env) return defaultMap;
  try {
    const parsed = JSON.parse(env);
    return { ...defaultMap, ...parsed };
  } catch {
    return defaultMap;
  }
}

export const sheetPuller = functions.https.onRequest(async (_req: any, res: any) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.SHEET_ID;
  const sheetName = process.env.SHEET_NAME || '一覧・操作';
  const sheetRange = process.env.SHEET_RANGE || 'A:M';

  if (!apiKey || !sheetId) {
    res.status(500).send('Missing environment configuration');
    return;
  }

  try {
    const g = await loadGoogle();
    const sheets = g.sheets({ version: 'v4', auth: apiKey });
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!${sheetRange}`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const values = result.data.values || [];
    const batch = db.batch();
    const fieldMap = getFieldMap();

    console.log('[sheetPuller] first data row', values[1]);

    const idIndex = fieldMap.id ?? 0;
    console.log('[sheetPuller] idIndex', idIndex);

    values.slice(1).forEach((row: string[]) => {

      const id = row[idIndex];
      if (!id) return;
      const docRef = db.collection('mailData').doc(id);
      const data: Record<string, string> = {};
      Object.entries(fieldMap).forEach(([field, idx]) => {
        if (field === 'id') return;
        data[field] = row[idx] || '';
      });
      console.log('[sheetPuller] preparing write', { id, data });
      batch.set(docRef, data);
    });

    await batch.commit();
    console.log('[sheetPuller] batch committed', { count: values.length - 1 });

    // テンプレート読み込み
    const tSheetId = process.env.TEMPLATE_SHEET_ID || sheetId;
    const tSheetName = process.env.TEMPLATE_SHEET_NAME || 'Template';
    const tSheetRange = process.env.TEMPLATE_SHEET_RANGE || 'A:B';
    try {
      const tResult = await sheets.spreadsheets.values.get({
        spreadsheetId: tSheetId,
        range: `${tSheetName}!${tSheetRange}`,
        valueRenderOption: 'UNFORMATTED_VALUE',
      });
      const tValues = tResult.data.values || [];
      const templateRow = tValues[1] || [];
      const map = getTemplateMap();
      const tData: Record<string, string> = {};
      Object.entries(map).forEach(([field, idx]) => {
        tData[field] = templateRow[idx] || '';
      });
      const docRef = db.doc('settings/followup');
      await docRef.set(tData, { merge: true });
    } catch (e) {
      console.warn('[sheetPuller] template fetch failed', e);
    }

    res.status(200).json({ pulled: values.length - 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Debug endpoint — returns the project IDs that the Admin SDK と環境変数が示している値を確認するためのもの。
 * ブラウザまたは curl で /debug を叩くと JSON で projectId を返す。
 */
export const debug = functions.https.onRequest((_req, res) => {
  res.json({
    sdkProject: admin.app().options.projectId,
    envProject: process.env.GCP_PROJECT || process.env.PROJECT_ID,
  });
});
