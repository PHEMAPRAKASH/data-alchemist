'use client';
import React from 'react';

type Allocation = {
  task: string;
  worker: string;
  score: number;
};

type Props = {
  results: Allocation[];
};

const AllocationResult: React.FC<Props> = ({ results }) => {
  if (!results.length) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <h2>📊 Allocation Results</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Task</th>
            <th>Assigned Worker</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res, idx) => (
            <tr key={idx}>
              <td>{res.task}</td>
              <td>{res.worker}</td>
              <td>{res.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationResult;
