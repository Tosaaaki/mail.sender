import assert from 'assert';
import fs from 'fs';
import * as admin from 'firebase-admin';

if (!fs.existsSync('./functions/dist/admin')) {
  try {
    fs.copyFileSync('./functions/dist/admin.js', './functions/dist/admin');
  } catch (err) {
    // ignore if copy fails
  }
}

if (!('apps' in admin)) {
  admin.apps = [];
}

const { getCount } = await import('./functions/dist/getCount.js');
const { sendMail } = await import('./functions/dist/sendMail.js');

// Test getCount
admin.__setData({ emails: [1, 2, 3] });
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
const req2 = { get: () => 'Bearer valid' };
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

console.log('Tests passed');
