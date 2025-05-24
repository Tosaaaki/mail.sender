let values: string[][] = [];
export function __setValues(v: string[][]) {
  values = v;
}
export const google = {
  sheets() {
    return {
      spreadsheets: {
        values: {
          async get() {
            return { data: { values } };
          }
        }
      }
    };
  }
};
