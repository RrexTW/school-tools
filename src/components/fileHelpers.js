import Papa from "papaparse";

export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const names = results.data
          .flat()
          .map((s) => String(s).trim())
          .filter(Boolean);
        resolve(names);
      },
      error: (err) => reject(err),
    });
  });
}
