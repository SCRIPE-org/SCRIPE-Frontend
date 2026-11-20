import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DataExchangeStudioOverlay } from "../DataExchangeStudioOverlay";

const mockVm: Record<string, unknown> = {};

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr" as const,
    t: (k: string, params?: Record<string, string | number>) =>
      params ? `${k}:${JSON.stringify(params)}` : k,
  }),
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

vi.mock("../../store/useDataExchangeJobsStore", () => ({
  useDataExchangeJobsStore: {
    getState: () => ({ trackJob: vi.fn() }),
  },
}));

vi.mock("../../viewmodels/useDataExchangeStudioViewModel", () => ({
  useDataExchangeStudioViewModel: () => mockVm,
}));

function resetMockVm(overrides: Record<string, unknown> = {}) {
  Object.keys(mockVm).forEach((k) => delete mockVm[k]);
  Object.assign(mockVm, {
    isAr: false,
    step: "upload",
    setStep: vi.fn(),
    isMultiSheet: false,
    setIsMultiSheet: vi.fn(),
    primaryDescriptor: {
      descriptor: {
        entityKey: "crm.lead",
        owningModule: "CRM",
        displayNameEn: "Leads",
        displayNameAr: "العملاء",
        supportedModes: ["Upsert"],
        columns: [],
      },
      quota: { allowed: true, planCode: "PRO", remainingRecords: 100, usedRecords: 0, maxRecords: 100 },
      canImport: true,
      canExport: true,
      isImportFeatureEnabled: true,
      isExportFeatureEnabled: true,
      restrictedFieldKeys: [],
    },
    resolvedMultiSheetEntityKeys: [],
    descriptorByEntity: {},
    presets: [],
    inspectResult: null,
    selectedFile: null,
    sheetStates: [],
    activeSheetName: "",
    setActiveSheetName: vi.fn(),
    activeSheet: null,
    activeSheetState: null,
    activeDescriptorResponse: null,
    importMode: "Upsert",
    setImportMode: vi.fn(),
    onboardingMode: "StagedPendingInvite",
    setOnboardingMode: vi.fn(),
    allowCreateMissingLookups: false,
    setAllowCreateMissingLookups: vi.fn(),
    sourceTimeZoneId: "UTC",
    setSourceTimeZoneId: vi.fn(),
    dryRunResult: null,
    executeResult: null,
    polledJob: null,
    isLoadingMeta: false,
    isInspecting: false,
    errorBanner: null,
    setErrorBanner: vi.fn(),
    infoBanner: null,
    setInfoBanner: vi.fn(),
    credentialsDismissed: false,
    setCredentialsDismissed: vi.fn(),
    dismissCredentials: vi.fn(),
    resetWorkflow: vi.fn(),
    inspectUploadedFile: vi.fn(),
    retryLoadMetadata: vi.fn(),
    activeRestrictedSet: new Set<string>(),
    activeMissingRequired: [],
    activeCompatibilityIssues: [],
    missingRequiredBySheet: {},
    compatibilityIssuesBySheet: {},
    totalMissingRequired: 0,
    totalCompatibilityIssues: 0,
    expressReady: false,
    presetNameInput: "",
    setPresetNameInput: vi.fn(),
    isSavingPreset: false,
    reAutoMapActiveSheet: vi.fn(),
    applyPreset: vi.fn(),
    removePreset: vi.fn(),
    saveCurrentPreset: vi.fn(),
    updateColumnMapping: vi.fn(),
    updateSheetMeta: vi.fn(),
    isDryRunning: false,
    isExecuting: false,
    isDownloading: false,
    isCancelling: false,
    runDryRun: vi.fn(),
    commitImport: vi.fn(),
    cancelJob: vi.fn(),
    downloadTemplate: vi.fn(),
    downloadRejectedWorkbook: vi.fn(),
    ...overrides,
  });
}

describe("DataExchangeStudioOverlay hardening flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockVm();
  });

  it("shows replaceFileTitle, replaceFileDesc, and changeFile CTA when confirmAction === 'reset'", () => {
    resetMockVm({
      step: "mapping",
      inspectResult: {
        uploadId: "up-1",
        fileName: "leads.xlsx",
        format: "xlsx",
        byteSize: 100,
        entityKey: "crm.lead",
        isMultiSheet: false,
        sheets: [
          {
            sheetName: "Leads",
            suggestedEntityKey: "crm.lead",
            isEmpty: false,
            rowCount: 1,
            headers: ["Email"],
            sampleRows: [],
            suggestedMappings: [],
            schemaWarnings: [],
          },
        ],
      },
      activeSheet: {
        sheetName: "Leads",
        suggestedEntityKey: "crm.lead",
        isEmpty: false,
        rowCount: 1,
        headers: ["Email"],
        sampleRows: [],
        suggestedMappings: [],
        schemaWarnings: [],
      },
      activeSheetState: {
        sheetName: "Leads",
        entityKey: "crm.lead",
        mode: "Upsert",
        mappings: [],
      },
      sheetStates: [
        {
          sheetName: "Leads",
          entityKey: "crm.lead",
          mode: "Upsert",
          mappings: [],
        },
      ],
    });

    render(
      <DataExchangeStudioOverlay open={true} onOpenChange={vi.fn()} entityKey="crm.lead" />
    );

    const replaceBtn = screen.getByRole("button", { name: /dataExchange\.actions\.changeFile/ });
    fireEvent.click(replaceBtn);

    expect(screen.getByText("dataExchange.confirmExit.replaceFileTitle")).toBeTruthy();
    expect(screen.getByText("dataExchange.confirmExit.replaceFileDesc")).toBeTruthy();
    expect(screen.getByTestId("studio-exit-confirm-btn").textContent).toContain(
      "dataExchange.actions.changeFile"
    );
  });

  it("handles clipboard unavailability/failure with errorBanner and wires dismissCredentials + retryLoadMetadata", async () => {
    const setErrorBanner = vi.fn();
    const dismissCredentials = vi.fn();
    const retryLoadMetadata = vi.fn();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("Permission denied")) },
      configurable: true,
    });

    resetMockVm({
      step: "results",
      setErrorBanner,
      dismissCredentials,
      executeResult: {
        jobId: "job-1",
        status: "Completed",
        executedSynchronously: true,
        totalRows: 1,
        committedRows: 1,
        createdRows: 1,
        updatedRows: 0,
        rejectedRows: 0,
        hasRejectedWorkbook: false,
        ephemeralCredentials: [
          { rowNumber: 2, email: "a@b.com", username: "ab", oneTimePassword: "pw" },
        ],
      },
    });

    const { rerender } = render(
      <DataExchangeStudioOverlay open={true} onOpenChange={vi.fn()} entityKey="crm.lead" />
    );

    fireEvent.click(screen.getByRole("button", { name: /dataExchange\.actions\.copyCredentials/ }));
    await waitFor(() => {
      expect(setErrorBanner).toHaveBeenCalledWith("dataExchange.errors.clipboardUnavailable");
    });

    fireEvent.click(screen.getByRole("button", { name: /dataExchange\.actions\.dismissCredentials/ }));
    expect(dismissCredentials).toHaveBeenCalledTimes(1);

    resetMockVm({
      step: "upload",
      primaryDescriptor: null,
      errorBanner: "Failed to load metadata",
      retryLoadMetadata,
    });
    rerender(
      <DataExchangeStudioOverlay open={true} onOpenChange={vi.fn()} entityKey="crm.lead" />
    );
    fireEvent.click(screen.getByRole("button", { name: /dataExchange\.actions\.retry/ }));
    expect(retryLoadMetadata).toHaveBeenCalledTimes(1);
  });
});
