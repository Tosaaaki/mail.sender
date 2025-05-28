import dotenv from 'dotenv';

dotenv.config();

let google: any;
try {
  ({ google } = await import('googleapis'));
} catch {
  ({ google } = await import('./googleapis-stub.js'));
}

type TemplateMap = Record<string, number>;

function getFieldMap(): TemplateMap {
  const defaultMap: TemplateMap = {
    subject1: 1,
    subject2: 2,
    subject3: 3,
    body1: 5,
    body2: 6,
    body3: 7,
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

export async function getTemplate(id: string, stage: number): Promise<{ subject: string | null; body: string | null }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.TEMPLATE_SHEET_ID;
  const sheetName = process.env.TEMPLATE_SHEET_NAME || 'Template';
  const sheetRange = process.env.TEMPLATE_SHEET_RANGE || 'A:H';

  if (!apiKey || !sheetId) {
    throw new Error('Missing Sheets configuration');
  }

  const sheets = google.sheets({ version: 'v4', auth: apiKey });
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!${sheetRange}`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });
  const values = result.data.values || [];
  let row: string[] | undefined;
  for (const r of values.slice(1)) {
    if (r[0] && String(r[0]) === id) {
      row = r;
      break;
    }
  }
  if (!row) return { subject: null, body: null };

  const map = getFieldMap();
  const subjectKey = `subject${stage}`;
  const bodyKey = `body${stage}`;
  const sIndex = map[subjectKey];
  const bIndex = map[bodyKey];
  const subject = sIndex !== undefined && row[sIndex] !== undefined && row[sIndex] !== '' ? row[sIndex] : null;
  const body = bIndex !== undefined && row[bIndex] !== undefined && row[bIndex] !== '' ? row[bIndex] : null;
  return { subject, body };
}
