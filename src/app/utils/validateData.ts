export type ValidationResult = {
  rowIndex: number;
  errors: string[];
};

export function validateData(rows: any[], requiredFields: string[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  rows.forEach((row, index) => {
    const rowErrors: string[] = [];

    requiredFields.forEach((field) => {
      if (!row[field] || row[field].toString().trim() === '') {
        rowErrors.push(`Missing ${field}`);
      }
    });

    // Example: PriorityLevel must be between 1-5
    if (row.PriorityLevel && (row.PriorityLevel < 1 || row.PriorityLevel > 5)) {
      rowErrors.push('PriorityLevel must be between 1 and 5');
    }

    if (rowErrors.length > 0) {
      results.push({ rowIndex: index, errors: rowErrors });
    }
  });

  return results;
}
