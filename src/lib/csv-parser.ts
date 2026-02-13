export interface StudentRow {
  name: string;
  email: string;
  phone?: string;
}

export interface ParseResult {
  data: StudentRow[];
  errors: Array<{ row: number; error: string }>;
  totalRows: number;
}

/**
 * Parse CSV content for student import
 * Expected format: name,email,phone
 */
export function parseStudentCSV(csvContent: string): ParseResult {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const data: StudentRow[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  // Skip header row
  const dataLines = lines.slice(1);

  for (let i = 0; i < dataLines.length; i++) {
    const rowNumber = i + 2; // +2 because we skipped header and 0-index
    const line = dataLines[i];

    // Handle quoted values (basic CSV parsing)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const [name, email, phone] = values;

    // Validate row
    if (!name && !email) {
      continue; // Skip empty rows
    }

    if (!name) {
      errors.push({ row: rowNumber, error: 'Nombre es requerido' });
      continue;
    }

    if (!email) {
      errors.push({ row: rowNumber, error: 'Email es requerido' });
      continue;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ row: rowNumber, error: 'Email inválido' });
      continue;
    }

    data.push({
      name,
      email,
      phone: phone || undefined,
    });
  }

  return {
    data,
    errors,
    totalRows: dataLines.length,
  };
}

/**
 * Validate student data for duplicates
 */
export function findDuplicateEmails(students: StudentRow[]): Map<string, number[]> {
  const emailMap = new Map<string, number[]>();

  students.forEach((student, index) => {
    const existing = emailMap.get(student.email) || [];
    existing.push(index + 1); // +1 for 1-based row numbers
    emailMap.set(student.email, existing);
  });

  // Filter to only show duplicates
  const duplicates = new Map<string, number[]>();
  emailMap.forEach((rows, email) => {
    if (rows.length > 1) {
      duplicates.set(email, rows);
    }
  });

  return duplicates;
}
