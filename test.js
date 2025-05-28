import assert from 'assert';
import path from 'path';
import Module from 'module';

process.env.NODE_PATH = path.resolve('test_stubs');
Module._initPaths();

process.env.USE_ADMIN_STUB = '1';
process.env.SMTP_DISABLE = '1';
import * as admin from './functions/dist/admin-stub.js';

const { getCount } = await import('./functions/dist/getCount.js');
const { sendMail } = await import('./functions/dist/sendMail.js');

// Test getCount
admin.__setData({ 'counters/default': { count: 3 }, 'mailData/x1': { number: 'x1', progress: '未送信' } });
const res1 = {
  statusCode: 200,
  body: null,
  json(data) { this.body = data; },
  status(code) { this.statusCode = code; return this; }
};
await getCount({}, res1);
assert.deepStrictEqual(res1.body, { count: 3 });
assert.strictEqual(res1.statusCode, 200);

// Test sendMail success
process.env.TASKS_SERVICE_ACCOUNT = 'svc@example.com';
const req2 = { get: () => 'Bearer valid', body: { id: 'x1', to: 'a@example.com', subject: 'hi', text: 'body', senderId: 'default' } };
const res2 = {
  statusCode: 200,
  body: null,
  json(data) { this.body = data; },
  send(data) { this.body = data; },
  status(code) { this.statusCode = code; return this; }
};
await sendMail(req2, res2);
assert.deepStrictEqual(res2.body, { sent: true });
assert.strictEqual(res2.statusCode, 200);
const mailData = admin.__getData('mailData/x1');
assert.strictEqual(mailData.progress, '送信済み');
assert.strictEqual(mailData.followupStage, 1);
assert.ok(mailData.lastSentAt instanceof Date);

// Verify counter incremented
const resCount = { statusCode: 200, body: null, json(d){this.body=d;}, status(c){this.statusCode=c;return this;} };
await getCount({}, resCount);
assert.deepStrictEqual(resCount.body, { count: 4 });
assert.strictEqual(resCount.statusCode, 200);

// Test sendMail unauthorized
const req3 = { get: () => 'Bearer invalid' };
const res3 = {
  statusCode: 200,
  body: null,
  json(data) { this.body = data; },
  send(data) { this.body = data; },
  status(code) { this.statusCode = code; return this; }
};
await sendMail(req3, res3);
assert.strictEqual(res3.statusCode, 401);
assert.strictEqual(res3.body, 'Unauthorized');

// Test sheetPuller with stubbed Sheets data
const { sheetPuller } = await import('./functions/dist/sheetPuller.js');
const sheetsStub = await import('./functions/dist/googleapis-stub.js');
sheetsStub.__setValues([
  ['header'],
  ['1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1'],
  ['2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2']
]);
process.env.SHEET_ID = 'dummy';
process.env.SHEET_NAME = 'Sheet1';
process.env.SHEET_RANGE = 'A:G';
process.env.GOOGLE_API_KEY = 'dummy';
process.env.SHEET_FIELD_MAP = JSON.stringify({
  id: 3,
  send_date: 0,
  progress: 1,
  manager_name: 2,
  number: 3,
  facility_name: 4,
  operator_name: 5,
  email: 6
});
const res4 = { statusCode: 200, body: null, json(d){this.body=d;}, status(c){this.statusCode=c; return this;} };
await sheetPuller({}, res4);
assert.strictEqual(res4.statusCode, 200);
assert.deepStrictEqual(res4.body, { pulled: 2 });
assert.deepStrictEqual(admin.__getData('mailData/d1'), {
  send_date: '1',
  progress: 'b1',
  manager_name: 'c1',
  number: 'd1',
  facility_name: 'e1',
  operator_name: 'f1',
  hp_url: '',
  email: 'g1'
});
assert.deepStrictEqual(admin.__getData('mailData/d2'), {
  send_date: '2',
  progress: 'b2',
  manager_name: 'c2',
  number: 'd2',
  facility_name: 'e2',
  operator_name: 'f2',
  hp_url: '',
  email: 'g2'
});

console.log('Tests passed');
