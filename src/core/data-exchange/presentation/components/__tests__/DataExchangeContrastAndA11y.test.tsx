import React, { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StudioUploadStep } from "../studio/StudioUploadStep";
import { StudioDryRunStep } from "../studio/StudioDryRunStep";
import { StudioResultsStep } from "../studio/StudioResultsStep";
import { StudioEphemeralCredentialsCard } from "../studio/StudioEphemeralCredentialsCard";
import { StudioStepper } from "../studio/StudioStepper";
import { DataExchangeTenantRequiredCard } from "../DataExchangeTenantRequiredCard";
import { DataExchangeFloatingDock } from "../DataExchangeFloatingDock";
import type {
  DataExchangeDryRunResponseDto,
  DataExchangeExecuteImportResponseDto,
  DataTransferJobDto,
} from "../../../domain/types";

let mockDockState: {
  direction: "ltr" | "rtl";
  isAr: boolean;
  isVisible: boolean;
  jobs: DataTransferJobDto[];
  activeCount: number;
  isCollapsed: boolean;
  cancellingJobIds: Record<string, boolean>;
  downloadingJobIds: Record<string, "export" | "rejected" | null>;
  hasFinishedJobs: boolean;
  toggleCollapsed: ReturnType<typeof vi.fn>;
  clearFinished: ReturnType<typeof vi.fn>;
  dismissJob: ReturnType<typeof vi.fn>;
  handleCancelJob: ReturnType<typeof vi.fn>;
  handleDownload: ReturnType<typeof vi.fn>;
} = {
  direction: "ltr",
  isAr: false,
  isVisible: true,
  jobs: [
    {
      id: "job-1",
      kind: "Import",
      entityKey: "players",
      isMultiSheet: false,
      importMode: "Upsert",
      onboardingMode: "StagedPendingInvite",
      fileFormat: "xlsx",
      originalFileName: "players.xlsx",
      status: "Running",
      totalRows: 100,
      processedRows: 40,
      progressPercent: 40,
      validRows: 40,
      committedRows: 0,
      createdRows: 0,
      updatedRows: 0,
      rejectedRows: 0,
      hasRejectedWorkbook: true,
      hasExportWorkbook: false,
      createdAt: "2026-11-15T00:00:00Z",
      expiresAtUtc: "2026-11-16T00:00:00Z",
    },
  ],
  activeCount: 1,
  isCollapsed: false,
  cancellingJobIds: {},
  downloadingJobIds: {},
  hasFinishedJobs: false,
  toggleCollapsed: vi.fn(),
  clearFinished: vi.fn(),
  dismissJob: vi.fn(),
  handleCancelJob: vi.fn(),
  handleDownload: vi.fn(),
};

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    direction: "ltr" as const,
    language: "en",
    t: (key: string) => key,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../../viewmodels/useDataExchangeFloatingDockViewModel", () => ({
  useDataExchangeFloatingDockViewModel: () => mockDockState,
}));

describe("Data Exchange contrast, semantic tokens, and a11y", () => {
  beforeEach(() => {
    mockDockState = { ...mockDockState, isVisible: true, isCollapsed: false };
  });

  it("StudioUploadStep uses stretched <button> without role='button' div or nested interactive controls", () => {
    const fileInputRef = createRef<HTMLInputElement>();
    const input = document.createElement("input");
    const clickSpy = vi.spyOn(input, "click");
    (fileInputRef as { current: HTMLInputElement | null }).current = input;

    const onFileChosen = vi.fn();
    const { container } = render(
      <StudioUploadStep
        fileInputRef={fileInputRef}
        isInspecting={false}
        isMultiSheet={false}
        multiSheetEntityKeys={["players", "coaches"]}
        onToggleMultiSheet={vi.fn()}
        onFileChosen={onFileChosen}
        onDownloadTemplate={vi.fn()}
        isDownloading={false}
      />
    );

    expect(container.querySelector('div[role="button"]')).toBeNull();

    const dropzoneTrigger = screen.getByTestId("studio-dropzone-trigger");
    expect(dropzoneTrigger.tagName).toBe("BUTTON");
    expect(dropzoneTrigger).toHaveAttribute("aria-label", "dataExchange.upload.dropTitle");

    const switchEl = screen.getByRole("switch");
    expect(switchEl.parentElement?.closest("button")).toBeNull();
    expect(dropzoneTrigger.contains(switchEl)).toBe(false);

    const chooseBtn = screen.getByTestId("studio-choose-file-btn");
    expect(chooseBtn.className).toContain("bg-nx-accent-fill");
    expect(chooseBtn.className).toContain("text-nx-on-fill");
    expect(chooseBtn.closest("button")).toBe(chooseBtn);

    fireEvent.click(dropzoneTrigger);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const dropFile = new File(["test"], "roster.csv", { type: "text/csv" });
    fireEvent.drop(dropzoneTrigger.parentElement!, {
      dataTransfer: { files: [dropFile] },
    });
    expect(onFileChosen).toHaveBeenCalledTimes(1);
  });

  it("DataExchangeTenantRequiredCard uses bg-nx-accent-fill CTA, warning tokens, and rtl:rotate-180", () => {
    const { container } = render(
      <DataExchangeTenantRequiredCard
        title="Tenant Required"
        description="Select a tenant"
        switchHint="Open Tenants"
        goToTenantsLabel="Go to Tenants"
        retryLabel="Retry"
      />
    );

    const goBtn = screen.getByTestId("tenant-required-go-tenants");
    expect(goBtn.className).toContain("bg-nx-accent-fill");
    expect(goBtn.className).toContain("text-nx-on-fill");
    expect(container.innerHTML).toContain("border-warning-strong/40");
    expect(container.innerHTML).toContain("bg-warning/15");
    expect(container.innerHTML).not.toMatch(/\b[a-z-]+-nx-[a-z0-9-]+\/\d+\b/);
    expect(container.innerHTML).toContain("text-nx-warning-strong");
    expect(container.querySelector("svg.lucide-arrow-right")?.getAttribute("class")).toContain(
      "rtl:rotate-180"
    );
  });

  it("StudioDryRunStep, StudioResultsStep, and StudioEphemeralCredentialsCard use canonical nx-danger and nx-warning tokens + tabular-nums", () => {
    const dryRunResult: DataExchangeDryRunResponseDto = {
      uploadId: "u1",
      canExecute: true,
      executedSyncEligible: true,
      totalRows: 10,
      validRows: 8,
      invalidRows: 2,
      estimatedNewInserts: 8,
      estimatedUpdates: 0,
      quotaPassed: true,
      sheetSummaries: [
        {
          sheetName: "Sheet1",
          entityKey: "players",
          totalRows: 10,
          validRows: 8,
          invalidRows: 2,
          estimatedNewInserts: 8,
          estimatedUpdates: 0,
          quotaPassed: true,
        },
      ],
      sampleErrors: [],
    };

    const dryRunView = render(<StudioDryRunStep dryRunResult={dryRunResult} />);
    expect(dryRunView.container.innerHTML).toContain("border-warning-strong/40");
    expect(dryRunView.container.innerHTML).toContain("bg-warning/15");
    expect(dryRunView.container.innerHTML).not.toMatch(/\b[a-z-]+-nx-[a-z0-9-]+\/\d+\b/);
    expect(dryRunView.container.innerHTML).toContain("text-nx-warning-strong");
    expect(dryRunView.container.innerHTML).toContain("text-nx-danger");
    expect(dryRunView.container.innerHTML).not.toContain("border-warning/");

    const executeResult: DataExchangeExecuteImportResponseDto = {
      jobId: "job-1",
      status: "CompletedWithErrors",
      executedSynchronously: true,
      totalRows: 10,
      committedRows: 8,
      createdRows: 8,
      updatedRows: 0,
      rejectedRows: 2,
      cascadeDeferredRows: 0,
      hasRejectedWorkbook: true,
      ephemeralCredentials: [
        {
          rowNumber: 1,
          email: "user@scripe.org",
          username: "user1",
          oneTimePassword: "Secret#123",
        },
      ],
    };

    const resultsView = render(
      <StudioResultsStep
        executeResult={executeResult}
        polledJob={null}
        credentialsDismissed={false}
        isDownloading={false}
        isCancelling={false}
        onDownloadRejected={vi.fn()}
        onResetWorkflow={vi.fn()}
        onCopyCredentials={vi.fn()}
        onDismissCredentials={vi.fn()}
        onCancelJob={vi.fn()}
        onMinimizeToBackground={vi.fn()}
      />
    );

    expect(resultsView.container.innerHTML).toContain("border-warning-strong/40");
    expect(resultsView.container.innerHTML).toContain("bg-warning/15");
    expect(resultsView.container.innerHTML).not.toMatch(/\b[a-z-]+-nx-[a-z0-9-]+\/\d+\b/);
    expect(resultsView.container.innerHTML).toContain("text-nx-danger");
    expect(resultsView.container.innerHTML).toContain("tabular-nums");
    const downloadRejectedBtn = screen.getByRole("button", {
      name: "dataExchange.actions.downloadRejected",
    });
    expect(downloadRejectedBtn.className).toContain("bg-nx-accent-fill");
    expect(downloadRejectedBtn.className).toContain("text-nx-on-fill");

    const credsView = render(
      <StudioEphemeralCredentialsCard
        credentials={executeResult.ephemeralCredentials!}
        onCopyCredentials={vi.fn()}
        onDismissCredentials={vi.fn()}
      />
    );
    expect(credsView.container.innerHTML).toContain("border-destructive/35");
    expect(credsView.container.innerHTML).toContain("bg-destructive/10");
    expect(credsView.container.innerHTML).not.toMatch(/\b[a-z-]+-nx-[a-z0-9-]+\/\d+\b/);
  });

  it("StudioStepper dismiss buttons and DataExchangeFloatingDock omit shadows and add accessible labels + tabular-nums", () => {
    mockDockState = {
      ...mockDockState,
      jobs: [
        ...mockDockState.jobs,
        {
          id: "job-2",
          kind: "Import" as const,
          entityKey: "players",
          isMultiSheet: false,
          importMode: "Upsert",
          onboardingMode: "StagedPendingInvite",
          fileFormat: "xlsx",
          originalFileName: "players2.xlsx",
          status: "CompletedWithErrors" as const,
          totalRows: 50,
          processedRows: 50,
          progressPercent: 100,
          validRows: 45,
          committedRows: 45,
          createdRows: 45,
          updatedRows: 0,
          rejectedRows: 5,
          hasRejectedWorkbook: true,
          hasExportWorkbook: false,
          createdAt: "2026-11-15T00:00:00Z",
          expiresAtUtc: "2026-11-16T00:00:00Z",
        },
      ],
    };

    render(
      <>
        <StudioStepper
          steps={[{ id: "upload", label: "Upload" }]}
          currentStep="upload"
          progressPercent={25}
          errorBanner="Upload failed"
          infoBanner="Heads up"
          onDismissError={vi.fn()}
          onDismissInfo={vi.fn()}
        />
        <DataExchangeFloatingDock />
      </>
    );

    expect(
      screen.getByRole("button", { name: "dataExchange.actions.dismissError" })
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "dataExchange.actions.dismissNotice" })
    ).toBeTruthy();

    const dockRegion = screen.getByRole("complementary", { name: "dataExchange.dock.title" });
    expect(dockRegion.innerHTML).not.toContain("shadow-nx-dropdown");
    expect(dockRegion.innerHTML).toContain("tabular-nums");
    expect(
      screen.getByRole("button", { name: "dataExchange.dock.downloadRejected" }).className
    ).toContain("text-nx-danger");
    expect(screen.getByRole("button", { name: "dataExchange.dock.collapse" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });
});
