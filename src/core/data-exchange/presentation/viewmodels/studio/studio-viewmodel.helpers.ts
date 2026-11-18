import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import type {
  DataExchangeColumnDescriptor,
  DataExchangeColumnMapping,
  DataExchangeDescriptorResponseDto,
  DataExchangeImportMode,
  DataExchangeInspectResponseDto,
  DataExchangeSavedPresetDto,
  DataExchangeTransformRule,
  MappingCompatibilityIssue,
} from "../../../domain/types";
import {
  findMissingRequiredFields,
  isExpressTemplateMatch,
  validateSheetMappings,
} from "../../../domain/mapping-validation";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = new Set([".xlsx", ".csv", ".tsv"]);

/** Active step inside SCRIPE Data Exchange Studio overlay. */
export type StudioStep = "upload" | "mapping" | "dryRun" | "results";

/** Editable mapping state scoped to a single worksheet inside an uploaded workbook. */
export interface SheetMappingState {
  sheetName: string;
  entityKey: string;
  mode: DataExchangeImportMode;
  mappings: DataExchangeColumnMapping[];
}

export interface UseDataExchangeStudioOptions {
  open: boolean;
  entityKey: string;
  initialMultiSheet?: boolean;
  multiSheetEntityKeys?: string[];
  initialPresetId?: string;
  onImportComplete?: () => void;
}

export const TERMINAL_JOB_STATUSES = new Set([
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
]);

export function createDefaultTransform(): DataExchangeTransformRule {
  return {
    trim: true,
    uppercase: false,
    lowercase: false,
    defaultValue: null,
    dateFormat: null,
    sourceTimeZoneId: null,
    canonicalizeNullTokens: true,
    collapseWhitespace: true,
    normalizeUnicodeCompatibility: true,
    stripArabicDiacritics: true,
    normalizeArabicLetters: false,
    caseMode: "None",
    stripCurrencyAndGrouping: true,
    convertAccountingNegatives: true,
    defaultCountryDialCode: null,
    normalizeEmailAddress: false,
    multiValueDelimiter: null,
  };
}

export function isAbortOrInterceptedError(error: unknown): boolean {
  if (error instanceof DownloadInterceptedError) return true;
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: unknown; code?: unknown };
  if (err.name === "AbortError" || err.name === "CanceledError") return true;
  if (err.code === "ERR_CANCELED") return true;
  return false;
}

export function extractErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const err = error as Record<string, unknown>;
  if (typeof err.status === "number") return err.status;
  if (typeof err.statusCode === "number") return err.statusCode;
  const response = err.response as Record<string, unknown> | undefined;
  if (response && typeof response.status === "number") return response.status;
  const details = err.details as Record<string, unknown> | undefined;
  if (details && typeof details.statusCode === "number") return details.statusCode;
  if (details && typeof details.status === "number") return details.status;
  return undefined;
}

export function validateUploadFileClientSide(
  file: File,
  t: (key: string, params?: Record<string, string | number>) => string
): string | null {
  const dotIdx = file.name.lastIndexOf(".");
  const ext = dotIdx >= 0 ? file.name.slice(dotIdx).toLowerCase() : "";
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
    return t("dataExchange.errors.invalidFileType");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return t("dataExchange.errors.fileTooLarge");
  }
  return null;
}

function extractErrorsArray(errorsVal: unknown): string[] {
  const out: string[] = [];
  if (Array.isArray(errorsVal)) {
    for (const item of errorsVal) {
      if (typeof item === "string" && item.trim().length > 0) {
        out.push(item.trim());
      } else if (typeof item === "object" && item !== null) {
        const rec = item as Record<string, unknown>;
        const msg = rec.message ?? rec.errorMessage ?? rec.description ?? rec.detail;
        if (typeof msg === "string" && msg.trim().length > 0) {
          out.push(msg.trim());
        }
      }
    }
  } else if (errorsVal && typeof errorsVal === "object") {
    for (const val of Object.values(errorsVal as Record<string, unknown>)) {
      if (Array.isArray(val)) {
        for (const entry of val) {
          if (typeof entry === "string" && entry.trim().length > 0) {
            out.push(entry.trim());
          }
        }
      } else if (typeof val === "string" && val.trim().length > 0) {
        out.push(val.trim());
      }
    }
  }
  return out;
}

function readMessageField(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload.trim();
  }
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  for (const key of ["message", "detail", "title", "error"] as const) {
    const val = obj[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }
  return null;
}

export function getStudioErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error.trim();
  }
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const errObj = error as {
    message?: unknown;
    details?: unknown;
    errors?: unknown;
    response?: { data?: unknown };
  };

  const payloadSources = [errObj.details, errObj.response?.data, errObj];
  const collectedErrors: string[] = [];
  let baseMsg: string | null = null;

  for (const source of payloadSources) {
    if (!source || typeof source !== "object") {
      if (!baseMsg && typeof source === "string" && source.trim().length > 0) {
        baseMsg = source.trim();
      }
      continue;
    }
    const rec = source as Record<string, unknown>;
    if (collectedErrors.length === 0 && "errors" in rec && rec.errors) {
      collectedErrors.push(...extractErrorsArray(rec.errors));
    }
    const candidateMsg = readMessageField(rec);
    if (candidateMsg && (!baseMsg || /^HTTP \d+$/.test(baseMsg))) {
      baseMsg = candidateMsg;
    }
  }

  const uniqueErrors = Array.from(new Set(collectedErrors)).filter(
    (msg) => msg !== baseMsg
  );

  if (baseMsg && !/^HTTP \d+$/.test(baseMsg)) {
    return uniqueErrors.length > 0
      ? `${baseMsg}: ${uniqueErrors.join("; ")}`
      : baseMsg;
  }

  if (uniqueErrors.length > 0) {
    return uniqueErrors.join("; ");
  }

  return fallback;
}

export function buildInitialMappingsForSheet(
  sheet: DataExchangeInspectResponseDto["sheets"][number],
  preset?: DataExchangeSavedPresetDto
): DataExchangeColumnMapping[] {
  const result: DataExchangeColumnMapping[] = [];
  for (const header of sheet.headers) {
    const suggestion = sheet.suggestedMappings.find(
      (s) => s.sourceColumnHeader.toLowerCase() === header.toLowerCase()
    );
    if (suggestion?.isDiagnosticColumn) {
      continue;
    }
    const presetMatch = preset?.mappings.find(
      (m) => m.sourceColumnHeader.toLowerCase() === header.toLowerCase()
    );
    const target = presetMatch?.targetFieldKey ?? suggestion?.targetFieldKey ?? "";
    result.push({
      sourceColumnHeader: header,
      targetFieldKey: target,
      transform: presetMatch?.transform ?? createDefaultTransform(),
      resolveByField: presetMatch?.resolveByField ?? null,
    });
  }
  return result;
}

export function computeStudioValidationSummary(params: {
  inspectResult: DataExchangeInspectResponseDto | null;
  sheetStates: SheetMappingState[];
  descriptorByEntity: Record<string, DataExchangeDescriptorResponseDto>;
  primaryDescriptor: DataExchangeDescriptorResponseDto | null;
  activeSheet: DataExchangeInspectResponseDto["sheets"][number] | null;
  activeSheetState: SheetMappingState | null;
  activeDescriptorResponse: DataExchangeDescriptorResponseDto | null;
  isMultiSheet: boolean;
}) {
  const {
    inspectResult,
    sheetStates,
    descriptorByEntity,
    primaryDescriptor,
    activeSheet,
    activeSheetState,
    activeDescriptorResponse,
    isMultiSheet,
  } = params;

  const compatibilityIssuesBySheet: Record<string, MappingCompatibilityIssue[]> = {};
  const missingRequiredBySheet: Record<string, DataExchangeColumnDescriptor[]> = {};
  let totalCompatibilityIssues = 0;
  let totalMissingRequired = 0;

  if (inspectResult) {
    for (const sState of sheetStates) {
      const inspected = inspectResult.sheets.find((s) => s.sheetName === sState.sheetName);
      const descResp = descriptorByEntity[sState.entityKey] ?? primaryDescriptor;
      if (!inspected || !descResp) continue;
      const restricted = new Set(descResp.restrictedFieldKeys);
      const sheetIssues = validateSheetMappings(
        inspected,
        sState.mappings,
        descResp.descriptor,
        restricted
      );
      compatibilityIssuesBySheet[sState.sheetName] = sheetIssues;
      totalCompatibilityIssues += sheetIssues.length;

      const sheetMissing =
        sState.mode !== "Update"
          ? findMissingRequiredFields(sState.mappings, descResp.descriptor)
          : [];
      missingRequiredBySheet[sState.sheetName] = sheetMissing;
      totalMissingRequired += sheetMissing.length;
    }
  }

  const activeRestrictedSet = new Set(activeDescriptorResponse?.restrictedFieldKeys ?? []);
  const activeCompatibilityIssues = activeSheetState
    ? compatibilityIssuesBySheet[activeSheetState.sheetName] ?? []
    : [];
  const activeMissingRequired =
    activeSheetState && activeSheetState.mode !== "Update"
      ? findMissingRequiredFields(
          activeSheetState.mappings,
          activeDescriptorResponse?.descriptor ?? null
        )
      : [];

  const expressReady =
    !isMultiSheet &&
    Boolean(activeSheet && activeSheetState && primaryDescriptor) &&
    isExpressTemplateMatch(
      activeSheet!,
      activeSheetState!.mappings,
      primaryDescriptor!.descriptor,
      new Set(primaryDescriptor!.restrictedFieldKeys)
    );

  return {
    compatibilityIssuesBySheet,
    missingRequiredBySheet,
    activeRestrictedSet,
    activeCompatibilityIssues,
    activeMissingRequired,
    totalCompatibilityIssues,
    totalMissingRequired,
    expressReady,
  };
}
