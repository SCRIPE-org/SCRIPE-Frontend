import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudioUploadStep } from "../StudioUploadStep";
import type { DataExchangeSchemaWarning } from "../../../../domain/types";

// Mock I18n provider
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    direction: "ltr",
    language: "en",
    t: (key: string, _params?: Record<string, string | number>) => {
      const dict: Record<string, string> = {
        "dataExchange.upload.dropTitle": "Drop your spreadsheet or browse from disk",
        "dataExchange.upload.dropHint": "Supports .xlsx, .csv, and .tsv up to 25 MB.",
        "dataExchange.actions.chooseFile": "Choose File",
        "dataExchange.upload.needTemplateTitle": "Starting from scratch?",
        "dataExchange.upload.needTemplateDesc": "Download a Smart Template",
        "dataExchange.actions.downloadTemplateXlsx": "Download Excel Template (.xlsx)",
        "dataExchange.actions.downloadTemplateCsv": "Download CSV Template (.csv)",
        "dataExchange.actions.downloadMultiSheetTemplate": "Download Multi-Sheet Template (.xlsx)",
        "dataExchange.actions.multiSheetMigration": "Multi-Sheet Migration",
        "dataExchange.upload.securityNote": "OWASP Protected",
        "dataExchange.schemaWarnings.title": "Schema Drift & Preset Warnings",
        "dataExchange.upload.schemaWarningsDesc": "Detected structural changes or version differences",
        "dataExchange.schemaWarnings.TEMPLATE_FINGERPRINT_DRIFT": "The uploaded template was generated from an older schema for Leads.",
        "dataExchange.schemaWarnings.PRESET_MISSING_HEADERS": "The preset expects worksheet column headers that are missing:",
      };
      return dict[key] || key;
    },
  }),
}));

describe("StudioUploadStep", () => {
  const defaultProps = {
    isMultiSheet: false,
    onToggleMultiSheet: vi.fn(),
    isInspecting: false,
    isDownloading: false,
    fileInputRef: { current: null },
    onFileChosen: vi.fn(),
    onDownloadTemplate: vi.fn(),
  };

  it("renders upload area and template download options", () => {
    render(<StudioUploadStep {...defaultProps} />);

    expect(screen.getByText("Drop your spreadsheet or browse from disk")).toBeInTheDocument();
    expect(screen.getByTestId("studio-choose-file-btn")).toBeInTheDocument();
    expect(screen.getByText("Download Excel Template (.xlsx)")).toBeInTheDocument();
  });

  it("renders schema drift warning banner when warnings are present", () => {
    const warnings: DataExchangeSchemaWarning[] = [
      {
        code: "TEMPLATE_FINGERPRINT_DRIFT",
        entityKey: "crm.lead",
        entityDisplayNameEn: "Leads",
      },
      {
        code: "PRESET_MISSING_HEADERS",
        presetName: "HubSpot Leads",
        sheetName: "Leads",
        items: ["Phone", "Email"],
      },
    ];

    render(<StudioUploadStep {...defaultProps} schemaWarnings={warnings} />);

    expect(screen.getByTestId("schema-warnings-banner")).toBeInTheDocument();
    expect(screen.getByText("Schema Drift & Preset Warnings")).toBeInTheDocument();
    expect(screen.getByText("Detected structural changes or version differences")).toBeInTheDocument();
    expect(screen.getByText("The uploaded template was generated from an older schema for Leads.")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("does not render schema drift warning banner when warnings array is empty or undefined", () => {
    const { rerender } = render(<StudioUploadStep {...defaultProps} schemaWarnings={[]} />);

    expect(screen.queryByTestId("schema-warnings-banner")).not.toBeInTheDocument();

    rerender(<StudioUploadStep {...defaultProps} schemaWarnings={undefined} />);
    expect(screen.queryByTestId("schema-warnings-banner")).not.toBeInTheDocument();
  });
});
