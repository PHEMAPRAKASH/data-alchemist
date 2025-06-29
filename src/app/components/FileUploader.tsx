'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

type Props = {
  onDataParsed: (sheetName: string, data: any[]) => void;
};

const FileUploader: React.FC<Props> = ({ onDataParsed }) => {
  const [fileName, setFileName] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (event) => {
        const csv = event.target?.result;
        if (typeof csv === 'string') {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              onDataParsed(file.name, result.data);
            },
          });
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        if (event.target?.result) {
          const data = new Uint8Array(event.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          onDataParsed(sheetName, json);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv,.xlsx" onChange={handleFile} />
      {fileName && <p>Uploaded: {fileName}</p>}
    </div>
  );
};

export default FileUploader;
