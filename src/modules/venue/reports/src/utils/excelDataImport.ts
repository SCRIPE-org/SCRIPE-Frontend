/**
 * Excel / CSV Staged Data Import Utility
 *
 * Implements requirements A12, A13, and A14:
 * - Staged workflow: Upload -> Type Select -> Map Columns -> Validate -> Preview -> Import
 * - Categorization: Valid rows, Warnings, Invalid rows, Duplicate candidates
 * - Safe scope: Customers and Courts (basic configuration)
 * - Canonical architecture: Invokes authoritative domain services (CustomerPickerService,
 *   FacilityRepository) — never direct DB inserts.
 */

export type ImportType = "customers" | "courts";

/**
 * Derives a stable idempotency key for one customer row within an import intent.
 * A new batch id is created for each newly parsed file; retries reuse it.
 */
export function createImportRowIdempotencyKey(batchId: string, rowNumber: number): string {
  return `${batchId}:customer-import:${rowNumber}`;
}

export interface TargetField {
  key: string;
  label: string;
  required: boolean;
  type: "string" | "number" | "email" | "select";
  options?: string[];
  sample: string;
  description: string;
}

export const IMPORT_SCHEMAS: Record<
  ImportType,
  { title: string; description: string; fields: TargetField[] }
> = {
  customers: {
    title: "Customer Directory Import",
    description: "Import individual or corporate customers into the canonical Party Registry.",
    fields: [
      {
        key: "name",
        label: "Customer / Contact Name",
        required: true,
        type: "string",
        sample: "Zaid Al-Mansoor",
        description: "Full personal or organization name.",
      },
      {
        key: "type",
        label: "Customer Type",
        required: false,
        type: "select",
        options: ["Person", "Organization"],
        sample: "Person",
        description: "Either Person or Organization (defaults to Person).",
      },
      {
        key: "email",
        label: "Email Address",
        required: false,
        type: "email",
        sample: "zaid@example.com",
        description: "Primary contact email for booking confirmations.",
      },
      {
        key: "phone",
        label: "Phone / Mobile",
        required: false,
        type: "string",
        sample: "+966 50 123 4567",
        description: "Mobile number for WhatsApp and SMS notifications.",
      },
    ],
  },
  courts: {
    title: "Courts & Spaces Import",
    description:
      "Import sports courts and rentable spaces into the Schedulable Resources registry.",
    fields: [
      {
        key: "name",
        label: "Court / Space Name",
        required: true,
        type: "string",
        sample: "Padel Court 3",
        description: "Distinctive display name for this court or pitch.",
      },
      {
        key: "category",
        label: "Sport / Category",
        required: false,
        type: "select",
        options: ["Padel", "Football", "Tennis", "Basketball", "Badminton", "General"],
        sample: "Padel",
        description: "Sport or facility discipline.",
      },
      {
        key: "capacity",
        label: "Capacity (Players)",
        required: false,
        type: "number",
        sample: "4",
        description: "Standard maximum player occupancy.",
      },
    ],
  },
};

export interface ParsedTableData {
  headers: string[];
  rawRows: string[][];
  rowCount: number;
}

/**
 * Robust RFC 4180 CSV / TSV parser that supports quotes, commas, newlines, and tabs.
 */
export function parseDelimitedText(text: string): ParsedTableData {
  const clean = text.replace(/^\uFEFF/, ""); // Remove BOM if present
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  // Auto-detect delimiter from first non-comment line (comma vs semicolon vs tab)
  const firstLine =
    clean.split(/\r?\n/).find((l) => l.trim().length > 0 && !l.startsWith("#")) || "";
  let delimiter = ",";
  if (firstLine.includes("\t")) delimiter = "\t";
  else if (firstLine.includes(";") && !firstLine.includes(",")) delimiter = ";";

  let i = 0;
  while (i < clean.length) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentCell.trim());
        currentCell = "";
        if (currentRow.some((c) => c.length > 0)) lines.push(currentRow);
        currentRow = [];
      } else if (char === "\n") {
        currentRow.push(currentCell.trim());
        currentCell = "";
        if (currentRow.some((c) => c.length > 0)) lines.push(currentRow);
        currentRow = [];
      } else {
        currentCell += char;
      }
    }
    i++;
  }

  // Push final cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) lines.push(currentRow);
  }

  // Filter out commented lines
  const dataLines = lines.filter((row) => row.length > 0 && !row[0].startsWith("#"));

  if (dataLines.length === 0) {
    return { headers: [], rawRows: [], rowCount: 0 };
  }

  const headers = dataLines[0].map((h) => h.trim());
  const rawRows = dataLines.slice(1);

  return {
    headers,
    rawRows,
    rowCount: rawRows.length,
  };
}

/**
 * Auto-detect column mappings by fuzzy header name matching.
 */
export function autoMapColumns(headers: string[], type: ImportType): Record<string, string> {
  const schema = IMPORT_SCHEMAS[type];
  const mapping: Record<string, string> = {};

  for (const field of schema.fields) {
    const targetKey = field.key.toLowerCase();
    const targetLabel = field.label.toLowerCase();

    const matchedHeader = headers.find((h) => {
      const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanKey = targetKey.replace(/[^a-z0-9]/g, "");
      const cleanLabel = targetLabel.replace(/[^a-z0-9]/g, "");

      return (
        cleanH === cleanKey ||
        cleanH === cleanLabel ||
        cleanH.includes(cleanKey) ||
        cleanKey.includes(cleanH) ||
        cleanLabel.includes(cleanH) ||
        cleanH.includes(cleanLabel)
      );
    });

    if (matchedHeader) {
      mapping[field.key] = matchedHeader;
    }
  }

  return mapping;
}

export interface ValidatedRow {
  rowNumber: number;
  data: Record<string, any>;
  status: "valid" | "warning" | "invalid" | "duplicate";
  messages: string[];
  duplicateMatch?: string;
}

export interface ValidationReport {
  totalRows: number;
  validCount: number;
  warningCount: number;
  invalidCount: number;
  duplicateCount: number;
  rows: ValidatedRow[];
  canCommit: boolean;
}

/**
 * Validates mapped rows against schema rules and checks duplicate candidates.
 */
export function validateImportRows(
  type: ImportType,
  table: ParsedTableData,
  mapping: Record<string, string>,
  existingEntities: Array<{ id: string; name: string }> = []
): ValidationReport {
  const schema = IMPORT_SCHEMAS[type];
  const validatedRows: ValidatedRow[] = [];

  const existingNamesLower = new Map<string, string>(
    existingEntities.map((e) => [e.name.toLowerCase().trim(), e.id])
  );
  const seenInFile = new Set<string>();

  table.rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // Row 1 is header
    const rowData: Record<string, any> = {};
    const messages: string[] = [];
    let status: "valid" | "warning" | "invalid" | "duplicate" = "valid";
    let duplicateMatch: string | undefined;

    // Extract mapped fields
    for (const field of schema.fields) {
      const headerName = mapping[field.key];
      if (!headerName) {
        if (field.required) {
          messages.push(`Required field "${field.label}" has no mapped column.`);
          status = "invalid";
        }
        continue;
      }

      const colIndex = table.headers.indexOf(headerName);
      const rawVal = colIndex >= 0 && colIndex < row.length ? row[colIndex] : "";

      if (field.required && (!rawVal || rawVal.trim().length === 0)) {
        messages.push(`Missing required value for "${field.label}".`);
        status = "invalid";
      }

      if (field.type === "number" && rawVal) {
        const num = Number(rawVal);
        if (isNaN(num) || num < 0) {
          messages.push(`Invalid number for "${field.label}": "${rawVal}".`);
          status = "invalid";
        } else {
          rowData[field.key] = num;
        }
      } else if (field.type === "email" && rawVal) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawVal)) {
          messages.push(`Format warning: "${rawVal}" may not be a valid email.`);
          if (status !== "invalid") status = "warning";
        }
        rowData[field.key] = rawVal;
      } else if (field.type === "select" && rawVal) {
        const options = field.options || [];
        const match = options.find((opt) => opt.toLowerCase() === rawVal.toLowerCase());
        if (match) {
          rowData[field.key] = match;
        } else {
          messages.push(`Warning: Value "${rawVal}" adapted to default "${options[0]}".`);
          rowData[field.key] = options[0];
          if (status !== "invalid") status = "warning";
        }
      } else {
        rowData[field.key] = rawVal;
      }
    }

    // Default values if missing
    if (type === "customers" && !rowData.type) {
      rowData.type = "Person";
    }

    // Duplicate detection
    const primaryName = (rowData.name || "").toString().trim();
    if (primaryName.length > 0) {
      const lowerName = primaryName.toLowerCase();

      if (seenInFile.has(lowerName)) {
        status = "duplicate";
        messages.push(`Duplicate within this file: "${primaryName}".`);
      } else if (existingNamesLower.has(lowerName)) {
        status = "duplicate";
        duplicateMatch = existingNamesLower.get(lowerName);
        messages.push(`Matches existing registered record in Venue: "${primaryName}".`);
      }
      seenInFile.add(lowerName);
    }

    if (messages.length === 0) {
      messages.push("Ready for import.");
    }

    validatedRows.push({
      rowNumber,
      data: rowData,
      status,
      messages,
      duplicateMatch,
    });
  });

  const validCount = validatedRows.filter((r) => r.status === "valid").length;
  const warningCount = validatedRows.filter((r) => r.status === "warning").length;
  const invalidCount = validatedRows.filter((r) => r.status === "invalid").length;
  const duplicateCount = validatedRows.filter((r) => r.status === "duplicate").length;

  return {
    totalRows: table.rawRows.length,
    validCount,
    warningCount,
    invalidCount,
    duplicateCount,
    rows: validatedRows,
    canCommit: validCount + warningCount > 0,
  };
}
