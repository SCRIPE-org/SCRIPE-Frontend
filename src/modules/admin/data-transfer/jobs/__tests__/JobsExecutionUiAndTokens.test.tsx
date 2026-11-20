import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TooltipProvider } from "@core/ui/tooltip";
import { DataTransferJob } from "../src/domain/entities/DataTransferJob";
import { DataExchangeEntity } from "../../entities/src/domain/entities/DataExchangeEntity";
import { DataExchangePreset } from "../../presets/src/domain/entities/DataExchangePreset";
import { JobExecutionCard } from "../src/presentation/components/JobExecutionCard";
import { JobsKpiHeader } from "../src/presentation/components/JobsKpiHeader";
import { CancelJobDialog } from "../src/presentation/components/CancelJobDialog";
import { JobsEmptyState, JobsErrorBanner } from "../src/presentation/components/JobsStateFeedback";
import { JobsSplitDetail } from "../src/presentation/components/JobsSplitDetail";
import { EntitiesKpiHeader } from "../../entities/src/presentation/components/EntitiesKpiHeader";
import { EntityCatalogCard } from "../../entities/src/presentation/components/EntityCatalogCard";
import { EntitiesSplitDetail } from "../../entities/src/presentation/components/EntitiesSplitDetail";
import { PresetsKpiHeader } from "../../presets/src/presentation/components/PresetsKpiHeader";
import { MappingPresetCard } from "../../presets/src/presentation/components/MappingPresetCard";
import { DeletePresetDialog } from "../../presets/src/presentation/components/DeletePresetDialog";
import { PresetsSplitDetail } from "../../presets/src/presentation/components/PresetsSplitDetail";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

const FULL_JOB_ID = "9b2a4f10-8a73-4f10-bc9e-6c7a8d9e1021";

function buildJob(overrides: Partial<ConstructorParameters<typeof DataTransferJob>[0]> = {}) {
  return new DataTransferJob({
    jobId: FULL_JOB_ID,
    kind: "Import",
    entityKey: "crm.lead",
    status: "Running",
    totalRows: 1200,
    processedRows: 600,
    progressPercent: 50,
    validRows: 590,
    committedRows: 580,
    createdRows: 500,
    updatedRows: 80,
    rejectedRows: 10,
    hasRejectedWorkbook: true,
    hasExportWorkbook: false,
    createdAt: "2026-11-10T10:00:00.000Z",
    expiresAtUtc: "2026-11-17T10:00:00.000Z",
    ...overrides,
  });
}

describe("Data Transfer UI tokens, RTL logical properties, Progress & Tooltips", () => {
  it("JobExecutionCard renders @core/ui/progress, focusable jobId copy button with tooltip, tabular-nums, me-1, and canonical danger/success classes without nx-*/alpha", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const job = buildJob({ status: "Running", rejectedRows: 10 });
    const onCancel = vi.fn();

    const { container, rerender } = render(
      <TooltipProvider>
        <JobExecutionCard
          job={job}
          onCancelJob={onCancel}
          onDownloadArtifact={vi.fn()}
        />
      </TooltipProvider>
    );

    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();

    const idTrigger = screen.getByTestId("job-card-id-tooltip-trigger");
    expect(idTrigger.tagName).toBe("BUTTON");
    expect(idTrigger).toHaveAttribute("aria-label", expect.stringContaining(FULL_JOB_ID));
    expect(idTrigger).toHaveTextContent("9b2a4f10...");
    fireEvent.click(idTrigger);
    expect(writeText).toHaveBeenCalledWith(FULL_JOB_ID);

    const html = container.innerHTML;
    expect(html).toContain("tabular-nums");
    expect(html).toContain("me-1");
    expect(html).toContain("text-nx-danger");
    expect(html).toContain("hover:bg-destructive/10");
    expect(html).not.toContain("nx-destructive");
    expect(html).not.toMatch(/nx-[a-z-]+\/\d+/);
    expect(html).not.toContain("ltr:mr-1");
    expect(html).not.toContain("rtl:ml-1");
    expect(html).not.toContain("rounded-nx-xs");

    rerender(
      <TooltipProvider>
        <JobExecutionCard
          job={buildJob({ status: "CompletedWithErrors", progressPercent: 100 })}
          onCancelJob={onCancel}
          onDownloadArtifact={vi.fn()}
        />
      </TooltipProvider>
    );
    expect(screen.getByRole("progressbar").firstElementChild?.className).toContain("bg-nx-warning");

    rerender(
      <TooltipProvider>
        <JobExecutionCard
          job={buildJob({ status: "Failed", progressPercent: 40 })}
          onCancelJob={onCancel}
          onDownloadArtifact={vi.fn()}
        />
      </TooltipProvider>
    );
    expect(screen.getByRole("progressbar").firstElementChild?.className).toContain("bg-nx-danger");

    rerender(
      <TooltipProvider>
        <JobExecutionCard
          job={buildJob({ status: "Completed", progressPercent: 100, hasExportWorkbook: true })}
          onCancelJob={onCancel}
          onDownloadArtifact={vi.fn()}
        />
      </TooltipProvider>
    );
    expect(screen.getByRole("progressbar").firstElementChild?.className).toContain("bg-nx-success");
    expect(container.innerHTML).toContain("hover:bg-success/10");
    expect(container.innerHTML).not.toMatch(/nx-[a-z-]+\/\d+/);

    rerender(
      <TooltipProvider>
        <JobExecutionCard
          job={buildJob({
            status: "Completed",
            progressPercent: 100,
            hasExportWorkbook: false,
            hasRejectedWorkbook: false,
          })}
          onCancelJob={onCancel}
          onDownloadArtifact={vi.fn()}
        />
      </TooltipProvider>
    );
    expect(screen.queryByTestId("job-card-actions-trigger")).not.toBeInTheDocument();
  });

  it("KPI headers use tabular-nums across all KPI tiles and canonical text-nx-danger", () => {
    const { container: jobsC } = render(
      <JobsKpiHeader
        kpis={{ totalJobs: 10, activeJobs: 2, completedJobs: 7, failedJobs: 1 }}
      />
    );
    expect(jobsC.querySelectorAll(".tabular-nums").length).toBe(4);
    expect(jobsC.innerHTML).toContain("text-nx-danger");
    expect(jobsC.innerHTML).not.toContain("nx-destructive");

    const { container: entitiesC } = render(
      <EntitiesKpiHeader
        kpis={{ total: 5, importable: 4, exportable: 5, quotaConstrained: 2 }}
      />
    );
    expect(entitiesC.querySelectorAll(".tabular-nums").length).toBe(4);

    const { container: presetsC } = render(
      <PresetsKpiHeader
        kpis={{ totalPresets: 3, defaultPresets: 1, entitiesCovered: 2, totalMappings: 18 }}
      />
    );
    expect(presetsC.querySelectorAll(".tabular-nums").length).toBe(4);
  });

  it("Dialogs omit shadow-nx-modal and rounded-nx-xs", () => {
    render(
      <>
        <CancelJobDialog
          job={buildJob()}
          open
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isCancelling={false}
        />
        <DeletePresetDialog
          preset={
            new DataExchangePreset({
              id: "preset-1",
              entityKey: "crm.lead",
              name: "Standard Lead Import",
              importMode: "Upsert",
              mappings: [],
            })
          }
          open
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          isDeleting={false}
        />
      </>
    );

    const cancelDialog = screen.getByTestId("cancel-job-dialog");
    const deleteDialog = screen.getByTestId("delete-preset-dialog");
    // @core/ui/dialog controls base modal elevation (single shadow-nx-modal); dialogs must not append manual overrides
    expect(cancelDialog.className.match(/shadow-nx-modal/g)?.length).toBe(1);
    expect(deleteDialog.className.match(/shadow-nx-modal/g)?.length).toBe(1);
    expect(cancelDialog.className).not.toMatch(/text-nx-ink.*shadow-nx-modal/);
    expect(deleteDialog.className).not.toMatch(/text-nx-ink.*shadow-nx-modal/);
    expect(cancelDialog.innerHTML).not.toContain("rounded-nx-xs");
    expect(deleteDialog.innerHTML).not.toContain("rounded-nx-xs");
    expect(cancelDialog.innerHTML).toContain("rounded-sm");
    expect(deleteDialog.innerHTML).toContain("rounded-sm");
  });

  it("EntityCatalogCard and MappingPresetCard enforce canonical Nexus tokens, danger badge, and me-1", () => {
    const entity = new DataExchangeEntity({
      entityKey: "crm.lead",
      owningModule: "CRM",
      displayNameEn: "CRM Leads",
      displayNameAr: "عملاء CRM",
      descriptionEn: "Lead records",
      descriptionAr: "سجلات العملاء",
      supportsBulkAutoCreateLookup: true,
      supportsIdentityOnboardingModes: false,
      supportedModes: ["Insert", "Upsert"],
      parentEntityKeys: [],
      remainingQuotaSlots: 0,
      quotaMaxLimit: 100,
      isImportFeatureEnabled: true,
      isExportFeatureEnabled: true,
      canImport: true,
      canExport: true,
    });

    const preset = new DataExchangePreset({
      id: "preset-1",
      entityKey: "crm.lead",
      name: "Leads Preset",
      importMode: "Insert",
      mappings: [{ sourceColumnHeader: "Email", targetFieldKey: "email" }],
      isDefault: false,
    });

    const { container: entityContainer } = render(
      <EntityCatalogCard
        entity={entity}
        onDownloadTemplate={vi.fn()}
        isDownloadingTemplate={false}
        onLaunchStudio={vi.fn()}
        onQuickExport={vi.fn()}
      />
    );
    expect(entityContainer.innerHTML).toContain("me-1");
    expect(entityContainer.innerHTML).toContain("rounded-sm");
    expect(entityContainer.innerHTML).toContain("text-destructive");
    expect(entityContainer.innerHTML).not.toContain("rounded-nx-xs");
    expect(entityContainer.innerHTML).not.toContain("ltr:mr-1");

    const { container: presetContainer } = render(
      <MappingPresetCard
        preset={preset}
        onDeletePreset={vi.fn()}
        onUseInStudio={vi.fn()}
      />
    );
    expect(presetContainer.innerHTML).toContain("me-1");
    expect(presetContainer.innerHTML).toContain("text-nx-danger");
    expect(presetContainer.innerHTML).toContain("hover:bg-destructive/10");
    expect(presetContainer.innerHTML).not.toContain("nx-destructive");
    expect(presetContainer.innerHTML).not.toMatch(/nx-[a-z-]+\/\d+/);
    expect(presetContainer.innerHTML).not.toContain("rounded-nx-xs");
    expect(presetContainer.innerHTML).not.toContain("ltr:mr-1");
    expect(entityContainer.innerHTML).not.toMatch(/nx-[a-z-]+\/\d+/);
  });

  it("JobsStateFeedback explicitly distinguishes error recovery vs filtered empty vs unfiltered empty states", () => {
    const onRetry = vi.fn();
    const onReset = vi.fn();

    render(<JobsErrorBanner message="Network timeout" onRetry={onRetry} />);
    const alert = screen.getByTestId("jobs-error-banner");
    expect(alert).toHaveAttribute("role", "alert");
    fireEvent.click(screen.getByTestId("jobs-error-retry-btn"));
    expect(onRetry).toHaveBeenCalledTimes(1);

    const { rerender } = render(
      <JobsEmptyState
        isTenantRequired={false}
        errorMessage="Network timeout"
        hasActiveFilters={false}
        onRetry={onRetry}
        onResetFilters={onReset}
      />
    );
    expect(screen.getByTestId("jobs-error-empty-state")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("jobs-empty-retry-btn"));
    expect(onRetry).toHaveBeenCalledTimes(2);

    rerender(
      <JobsEmptyState
        isTenantRequired={false}
        errorMessage={null}
        hasActiveFilters
        onRetry={onRetry}
        onResetFilters={onReset}
      />
    );
    expect(screen.getByTestId("jobs-filtered-empty-state")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("jobs-empty-reset-btn"));
    expect(onReset).toHaveBeenCalledTimes(1);

    rerender(
      <JobsEmptyState
        isTenantRequired={false}
        errorMessage={null}
        hasActiveFilters={false}
        onRetry={onRetry}
        onResetFilters={onReset}
      />
    );
    expect(screen.getByTestId("jobs-unfiltered-empty-state")).toBeInTheDocument();
  });

  it("SplitPane detail panels render structured telemetry for Jobs, Entities, and Presets", () => {
    render(
      <TooltipProvider>
        <JobsSplitDetail
          job={buildJob({
            importMode: "Upsert",
            onboardingMode: "InviteByEmail",
            errorSummary: "Row 14 failed FK check",
          })}
          entityDisplayName="CRM Leads"
          actions={<button type="button">Cancel</button>}
        />
        <EntitiesSplitDetail
          entity={
            new DataExchangeEntity({
              entityKey: "crm.lead",
              owningModule: "CRM",
              displayNameEn: "CRM Leads",
              displayNameAr: "عملاء",
              descriptionEn: "Lead ingestion",
              descriptionAr: "استيراد العملاء",
              supportsBulkAutoCreateLookup: true,
              supportsIdentityOnboardingModes: false,
              supportedModes: ["Insert"],
              parentEntityKeys: ["crm.pipeline"],
              remainingQuotaSlots: 0,
              quotaMaxLimit: 50,
              isImportFeatureEnabled: true,
              isExportFeatureEnabled: true,
              canImport: true,
              canExport: true,
            })
          }
          actions={<button type="button">Export</button>}
        />
        <PresetsSplitDetail
          preset={
            new DataExchangePreset({
              id: "preset-1",
              entityKey: "crm.lead",
              name: "Standard Mapping",
              importMode: "Upsert",
              mappings: [{ sourceColumnHeader: "LeadEmail", targetFieldKey: "email" }],
              isDefault: true,
            })
          }
          entityDisplayName="CRM Leads"
          actions={<button type="button">Use</button>}
        />
      </TooltipProvider>
    );

    expect(screen.getByTestId("jobs-split-detail")).toBeInTheDocument();
    expect(screen.getByText(FULL_JOB_ID)).toBeInTheDocument();
    expect(screen.getByText("Row 14 failed FK check")).toBeInTheDocument();
    expect(screen.getByText("adminDataTransferJobs.modes.Upsert")).toBeInTheDocument();
    expect(
      screen.getByText("adminDataTransferJobs.onboardingModes.InviteByEmail")
    ).toBeInTheDocument();
    expect(screen.getByTestId("entities-split-detail")).toBeInTheDocument();
    expect(screen.getByTestId("presets-split-detail")).toBeInTheDocument();
    expect(screen.getByText("LeadEmail")).toBeInTheDocument();
  });
});
