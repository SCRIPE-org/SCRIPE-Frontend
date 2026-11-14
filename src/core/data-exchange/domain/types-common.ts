/**
 * Core primitives, mode unions, and column mapping rules for SCRIPE Data Exchange Studio.
 * Mirrors Core.Application.DataExchange and DataTransfer.Application.DTOs.
 */

/** Supported execution modes for Data Exchange import batches. */
export type DataExchangeImportMode = "Insert" | "Update" | "Upsert";

/** Logical column data types enforced during spreadsheet mapping and normalization. */
export type DataExchangeColumnType =
  | "String"
  | "Int"
  | "Decimal"
  | "Bool"
  | "Date"
  | "DateTime"
  | "Enum"
  | "Lookup"
  | "Email"
  | "Phone"
  | "CustomField"
  | "Json";

/** Directionality and mutability classification for an entity column. */
export type DataExchangeFieldDirection = "Both" | "ImportOnly" | "ExportOnly" | "SystemGenerated";

/** Identity onboarding modes available when bulk-importing Admins or Users. */
export type DataExchangeIdentityOnboardingMode =
  | "StagedPendingInvite"
  | "ThrottledActivationEmails"
  | "OneTimeAutoPassword";

/** Kind of executed data exchange job. */
export type DataTransferJobKind = "Import" | "Export" | "MultiSheetMigration";

/** Execution lifecycle status of a data exchange job. */
export type DataTransferJobStatus =
  | "Queued"
  | "Running"
  | "Completed"
  | "CompletedWithErrors"
  | "Failed"
  | "Cancelled";

/** Exportable spreadsheet file formats supported by the engine. */
export type DataExchangeFileFormat = "xlsx" | "csv" | "tsv";

/** Artifact types downloadable from a completed or partial data exchange job. */
export type DataExchangeArtifactKind = "rejected" | "export";

/** Case transformation mode for normalized strings. */
export type DataExchangeCaseMode = "None" | "Lower" | "Upper" | "Title";

/** Optional per-column normalization and formatting rules applied during import. */
export interface DataExchangeTransformRule {
  trim?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  defaultValue?: string | null;
  dateFormat?: string | null;
  sourceTimeZoneId?: string | null;
  canonicalizeNullTokens?: boolean;
  collapseWhitespace?: boolean;
  normalizeUnicodeCompatibility?: boolean;
  stripArabicDiacritics?: boolean;
  normalizeArabicLetters?: boolean;
  caseMode?: DataExchangeCaseMode;
  stripCurrencyAndGrouping?: boolean;
  convertAccountingNegatives?: boolean;
  defaultCountryDialCode?: string | null;
  normalizeEmailAddress?: boolean;
  multiValueDelimiter?: string | null;
}

/** Mapping entry binding a spreadsheet source header to a target entity field key. */
export interface DataExchangeColumnMapping {
  sourceColumnHeader: string;
  targetFieldKey: string;
  transform?: DataExchangeTransformRule | null;
  resolveByField?: string | null;
}
