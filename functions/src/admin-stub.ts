// Minimal firebase-admin stub for tests
const store: Record<string, any> = {};

export const apps: any[] = [];
export function initializeApp() {
  apps.push({});
}

class IncrementValue {
  constructor(public n: number) {}
}

export const firestore = () => ({
  doc(path: string) {
    return {
      path,
      async get() {
        const data = store[path];
        return { exists: data !== undefined, data: () => data };
      },
      async set(value: any, opts?: { merge?: boolean }) {
        const current = store[path] || {};
        const update: any = {};
        for (const [k, v] of Object.entries(value)) {
          if (v instanceof IncrementValue) {
            const prev = current[k] || 0;
            update[k] = prev + v.n;
          } else {
            update[k] = v;
          }
        }
        store[path] = opts && opts.merge ? { ...current, ...update } : update;
      },
    };
  },
  collection(name: string) {
    return {
      doc(id: string) {
        return firestore().doc(`${name}/${id}`);
      }
    };
  },
  batch() {
    const ops: { ref: any; data: any }[] = [];
    return {
      set(ref: any, data: any) {
        ops.push({ ref, data });
      },
      async commit() {
        for (const { ref, data } of ops) {
          await ref.set(data);
        }
      }
    };
  },
});

export const FieldValue = {
  increment(n: number) {
    return new IncrementValue(n);
  },
  serverTimestamp() {
    return new Date();
  },
};
(firestore as any).FieldValue = FieldValue;

export const credential = {
  applicationDefault() { return {}; },
};

export function __setData(data: Record<string, any>) {
  for (const k of Object.keys(data)) {
    store[k] = data[k];
  }
}

export function __getData(path: string) {
  return store[path];
}

export default {
  apps,
  initializeApp,
  firestore,
  FieldValue,
  credential,
  __setData,
  __getData,
};
