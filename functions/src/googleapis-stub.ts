let queue: string[][][] = [];
export function __setValues(v: string[][]) {
  queue = [v];
}
export function __setValuesList(v: string[][][]) {
  queue = v.slice();
}
export const google = {
  sheets() {
    return {
      spreadsheets: {
        values: {
          async get() {
            const v = queue.length ? queue.shift() : [];
            return { data: { values: v } };
          }
        }
      }
    };
  }
};
