'use client';
import * as React from 'react';
import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Props = {
  rows: any[];
  errors?: number[];
};

const DataTable: React.FC<Props> = ({ rows, errors = [] }) => {
  const [query, setQuery] = useState('');

  if (!rows || rows.length === 0) return <p>No data to show.</p>;

  const columns: GridColDef[] = Object.keys(rows[0]).map((key) => ({
    field: key,
    headerName: key,
    flex: 1,
    editable: true,
  }));

  const processedRows = rows.map((row, index) => ({
    id: index,
    ...row,
  }));

  // 🔍 Smart filtering logic
  const filteredRows = useMemo(() => {
    if (!query.trim()) return processedRows;

    const [field, operator, ...rest] = query.split(' ');
    const value = rest.join(' ');

    if (!field || !operator || !value) return processedRows;

    return processedRows.filter((row) => {
      const fieldValue = row[field];
      if (fieldValue === undefined) return false;

      const val = isNaN(Number(value)) ? value : Number(value);

      switch (operator) {
        case '=':
        case '==':
          return fieldValue == val;
        case '>':
          return Number(fieldValue) > Number(val);
        case '<':
          return Number(fieldValue) < Number(val);
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(val).toLowerCase());
        default:
          return true;
      }
    });
  }, [query, processedRows]);

  return (
    <div style={{ height: 500, width: '100%' }}>
      {/* 🔍 Smart Search Input */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder='e.g. PriorityLevel > 2 or ClientName contains John'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '60%', padding: '6px', fontSize: '14px' }}
        />
      </div>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSizeOptions={[5, 10, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
        getRowClassName={(params) =>
          errors.includes(params.indexRelativeToCurrentPage) ? 'error-row' : ''
        }
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default DataTable;
