import Papa from "papaparse";

export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data || [];
        // 將每一列的欄位合併為一個字串（去除每個欄位的頭尾空白，並過濾空欄位）
        const names = rows
          .map((row) => {
            const cells = Array.isArray(row) ? row : [row];
            const joined = cells
              .map((c) => String(c).trim())
              .filter(Boolean)
              .join("");
            return joined;
          })
          .filter(Boolean); // 排除空列
        resolve(names);
      },
      error: (err) => reject(err),
    });
  });
}
