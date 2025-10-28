// src/workers/excelWorker.js

import * as XLSX from 'xlsx';

self.onmessage = function (e) {
  const { fileBuffer } = e.data;

  const start = performance.now();
  const data = new Uint8Array(fileBuffer);
  const workbook = XLSX.read(data, { type: "array" });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const end = performance.now();

  // 把结果返回给主线程
  self.postMessage({
    jsonData,
    duration: end - start
  });
};
