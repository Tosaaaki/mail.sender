import assert from 'assert';
import path from 'path';
import Module from 'module';

process.env.NODE_PATH = path.resolve('test_stubs');
Module._initPaths();

process.env.USE_ADMIN_STUB = '1';
process.env.SMTP_DISABLE = '1';
process.env.TASKS_SERVICE_ACCOUNT = 'svc@example.com';

import * as admin from './functions/dist/admin-stub.js';
const { sendMail } = await import('./functions/dist/sendMail.js');
const { sheetPuller } = await import('./functions/dist/sheetPuller.js');
const sheetsStub = await import('./functions/dist/googleapis-stub.js');

let called = false;
async function mockSendMail(req, res) {
  called = true;
  await sendMail(req, res);
}

function shouldSend(row, intervalDays) {
  const stage = row.followupStage || 0;
  if (stage >= 3) return false;
  if (!row.sent_at) return true;
  const diff = Date.now() - new Date(row.sent_at).getTime();
  return diff / 86400000 >= intervalDays;
}

async function maybeSend(row, intervalDays) {
  if (shouldSend(row, intervalDays)) {
    const req = { get: () => 'Bearer valid', body: { id: row.number, to: row.email, subject: 'hi', text: 'body', senderId: 'default' } };
    const res = { statusCode: 200, body: null, json(d){this.body=d;}, send(d){this.body=d;}, status(c){this.statusCode=c; return this;} };
    await mockSendMail(req, res);
    row.followupStage = (row.followupStage || 0) + 1;
    row.sent_at = new Date().toISOString();
    return res.statusCode;
  }
  return null;
}

admin.__setData({});

// template fetch via sheetPuller
sheetsStub.__setValuesList([
  [
    ['h'],
    ['1','b','c','d','e','f','g']
  ],
  [
    ['sub','bod']
  ]
]);
process.env.SHEET_ID = 'd';
process.env.SHEET_NAME = 'S';
process.env.SHEET_RANGE = 'A:G';
process.env.GOOGLE_API_KEY = 'dummy';
process.env.SHEET_FIELD_MAP = JSON.stringify({id:3,send_date:0,progress:1,manager_name:2,number:3,facility_name:4,operator_name:5,email:6});
process.env.TEMPLATE_SHEET_ID = 'd';
process.env.TEMPLATE_SHEET_NAME = 'S';
process.env.TEMPLATE_SHEET_RANGE = 'A:B';
process.env.TEMPLATE_FIELD_MAP = JSON.stringify({subject1:0, body1:1});
const resp = {statusCode:0, body:null, json(d){this.body=d;}, status(c){this.statusCode=c; return this;}};
await sheetPuller({}, resp);
assert.strictEqual(admin.__getData('settings/followup').subject1, 'sub');

const row = { number: 'r1', email: 'a@example.com' };
await maybeSend(row, 3);
assert.ok(called, 'first send');
assert.strictEqual(row.followupStage, 1);

called = false;
row.sent_at = new Date(Date.now() - 2*86400000).toISOString();
await maybeSend(row, 3);
assert.ok(!called, 'interval not reached');

called = false;
row.sent_at = new Date(Date.now() - 4*86400000).toISOString();
await maybeSend(row, 3);
assert.ok(called, 'send after interval');
assert.strictEqual(row.followupStage, 2);

called = false;
row.followupStage = 3;
row.sent_at = new Date(Date.now() - 10*86400000).toISOString();
await maybeSend(row, 3);
assert.ok(!called, 'stage limit');

console.log('followup tests passed');
