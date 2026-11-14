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

export function getStudioErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
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
