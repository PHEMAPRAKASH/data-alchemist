'use client';
import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import DataTable from './components/DataTable';
import RuleBuilder from './components/RuleBuilder';
import { validateData, ValidationResult } from './utils/validateData';
import AllocationResult from './components/AllocationResult';
import { allocateTasks } from './components/TaskAllocator';

const Home = () => {
  const [uploadedData, setUploadedData] = useState<{ [key: string]: any[] }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: ValidationResult[] }>({});
  const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({});
  const [allocationResult, setAllocationResult] = useState<any[]>([]);

  const handleDataParsed = (sheetName: string, data: any[]) => {
    setUploadedData((prev) => ({
      ...prev,
      [sheetName]: data,
    }));

    const requiredFieldsMap: { [key: string]: string[] } = {
  clients: ['ClientID', 'ClientName', 'PriorityLevel'],
  tasks: ['TaskID', 'TaskName', 'Duration', 'RequiredSkills'],
  workers: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase'],
};

const sheetType = sheetName.toLowerCase().includes('client')
  ? 'clients'
  : sheetName.toLowerCase().includes('task')
  ? 'tasks'
  : sheetName.toLowerCase().includes('worker')
  ? 'workers'
  : 'unknown';

const requiredFields = requiredFieldsMap[sheetType] || [];
    const errors = validateData(data, requiredFields);

    setValidationErrors((prev) => ({
      ...prev,
      [sheetName]: errors,
    }));

    setSearchQueries((prev) => ({
      ...prev,
      [sheetName]: '',
    }));

    console.log(`${sheetName} validation issues:`, errors);
  };

  const handleSearchChange = (sheetName: string, query: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [sheetName]: query,
    }));
  };

  // Mock task & worker data
  const mockTasks = [
    { TaskID: 'T1', Duration: 2, RequiredSkills: ['Java'] },
    { TaskID: 'T2', Duration: 1, RequiredSkills: ['SQL'] },
  ];

  const mockWorkers = [
    {
      WorkerID: 'W1',
      Skills: ['Java', 'SQL'],
      AvailableSlots: [1, 2],
      MaxLoadPerPhase: 2,
    },
    {
      WorkerID: 'W2',
      Skills: ['SQL'],
      AvailableSlots: [2, 3],
      MaxLoadPerPhase: 1,
    },
  ];

 const handleRunAllocation = () => {
  const tasks = uploadedData['tasks.csv'] || [];
  const workers = uploadedData['workers.csv'] || [];

  if (!tasks.length || !workers.length) {
    alert("Please upload both tasks.csv and workers.csv to run allocation.");
    return;
  }

  const result = allocateTasks(
    tasks,
    workers,
    [], // Add rules here if needed
    {
      priorityWeight: 5,
      fairnessWeight: 5,
      fulfillmentWeight: 5,
    }
  );

  setAllocationResult(result);
};


  return (
    <div style={{ padding: 24 }}>
      <h1>📂 Data Alchemist – File Uploader</h1>
      <FileUploader onDataParsed={handleDataParsed} />

      <div style={{ marginTop: 40 }}>
        {Object.entries(uploadedData).map(([sheet, rows]) => (
          <div key={sheet} style={{ marginBottom: 50 }}>
            <h2>{sheet}</h2>

            {/* 🔍 Smart search input */}
            <input
              type="text"
              placeholder="e.g. PriorityLevel > 2"
              value={searchQueries[sheet] || ''}
              onChange={(e) => handleSearchChange(sheet, e.target.value)}
              style={{
                width: '60%',
                padding: '6px',
                fontSize: '14px',
                marginBottom: '10px',
              }}
            />

            <DataTable
              rows={rows}
              errors={validationErrors[sheet]?.map((e) => e.rowIndex) || []}
              query={searchQueries[sheet] || ''}
            />
          </div>
        ))}
      </div>

      {/* 📤 Allocation button and result */}
      <div style={{ marginTop: 32 }}>
        <button onClick={handleRunAllocation}>📥 Run Allocation</button>
        <AllocationResult results={allocationResult} />
      </div>

      <RuleBuilder />
    </div>
  );
};

export default Home;
