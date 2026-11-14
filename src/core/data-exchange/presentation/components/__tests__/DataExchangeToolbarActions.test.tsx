import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataExchangeToolbarActions } from "../DataExchangeToolbarActions";
import type { DataExchangeDescriptorResponseDto } from "../../../domain/types";

const mockHasPermission = vi.fn<(perm: string) => boolean>();
const mockGetEntityDescriptor = vi.fn();
const mockDownloadTemplateFile = vi.fn().mockResolvedValue(undefined);

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    t: (key: string) => key,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: mockHasPermission,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: false,
  }),
}));

vi.mock("@core/di", () => ({
  getCoreContainer: () => ({
    dataExchangeRepository: {
      getEntityDescriptor: mockGetEntityDescriptor,
      downloadTemplateFile: mockDownloadTemplateFile,
    },
  }),
}));

function buildDescriptor(
  overrides: Partial<DataExchangeDescriptorResponseDto> = {}
): DataExchangeDescriptorResponseDto {
  return {
    descriptor: {
      entityKey: "crm.lead",
      owningModule: "CRM",
      displayNameEn: "Leads",
      displayNameAr: "العملاء المحتملون",
      descriptionEn: "Lead import and export",
      descriptionAr: "استيراد وتصدير",
      requiredFeatureKey: "CRM.Enabled",
      moduleImportFeatureKey: "CRM.DataImport",
      requiredImportPermission: "crm.leads.import",
      requiredExportPermission: "crm.leads.export",
      requiredCreatePermission: "crm.leads.create",
      requiredUpdatePermission: "crm.leads.update",
      requiredViewPermission: "crm.leads.read",
      supportsBulkAutoCreateLookup: true,
      supportsIdentityOnboardingModes: false,
      supportedModes: ["Insert", "Update", "Upsert"],
      parentEntityKeys: [],
      columns: [],
    },
    isQuotaEnforced: false,
    isImportFeatureEnabled: false,
    isExportFeatureEnabled: false,
    canImport: false,
    canExport: false,
    restrictedFieldKeys: [],
    ...overrides,
  };
}

class MockPointerEvent extends MouseEvent {
  constructor(type: string, props: any) {
    super(type, props);
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

describe("DataExchangeToolbarActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDownloadTemplateFile.mockResolvedValue(undefined);
  });

  it("renders nothing when feature gates and permissions disallow import/export", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetEntityDescriptor.mockResolvedValueOnce(
      buildDescriptor({
        canImport: false,
        canExport: false,
        isImportFeatureEnabled: false,
        isExportFeatureEnabled: false,
      })
    );

    const { container } = render(<DataExchangeToolbarActions entityKey="crm.lead" />);

    await waitFor(() => {
      expect(mockGetEntityDescriptor).toHaveBeenCalledWith("crm.lead", expect.any(AbortSignal));
    });

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("dx-import-crm.lead")).toBeNull();
    expect(screen.queryByTestId("dx-export-crm.lead")).toBeNull();
  });

  it("renders Template, Import, Multi-Sheet Migration, and Export when authorized", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetEntityDescriptor.mockResolvedValueOnce(
      buildDescriptor({
        canImport: true,
        canExport: true,
        isImportFeatureEnabled: true,
        isExportFeatureEnabled: true,
      })
    );

    render(
      <DataExchangeToolbarActions
        entityKey="crm.lead"
        enableMultiSheetMigration
        multiSheetEntityKeys={["crm.account", "crm.lead"]}
        defaultOpen
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dx-trigger-crm.lead")).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByTestId("dx-import-crm.lead")).toBeTruthy();
    });

    expect(screen.getByTestId("dx-template-crm.lead")).toBeTruthy();
    expect(screen.getByTestId("dx-multisheet-crm.lead")).toBeTruthy();
    expect(screen.getByTestId("dx-export-crm.lead")).toBeTruthy();
  });

  it("automatically discovers backend-driven relatedMultiSheetEntityKeys when multiSheetEntityKeys prop is omitted", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetEntityDescriptor.mockResolvedValueOnce(
      buildDescriptor({
        canImport: true,
        canExport: true,
        isImportFeatureEnabled: true,
        isExportFeatureEnabled: true,
        descriptor: {
          ...buildDescriptor().descriptor,
          relatedMultiSheetEntityKeys: ["crm.account", "crm.contact", "crm.lead"],
        },
      })
    );

    render(
      <DataExchangeToolbarActions
        entityKey="crm.lead"
        defaultOpen
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dx-trigger-crm.lead")).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByTestId("dx-import-crm.lead")).toBeTruthy();
    });

    // Multi-sheet migration should be automatically visible because backend registered DAG has >1 keys
    expect(screen.getByTestId("dx-multisheet-crm.lead")).toBeTruthy();
  });

  it("respects enableMultiSheetMigration={false} as an explicit opt-out", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetEntityDescriptor.mockResolvedValueOnce(
      buildDescriptor({
        canImport: true,
        canExport: true,
        isImportFeatureEnabled: true,
        isExportFeatureEnabled: true,
        descriptor: {
          ...buildDescriptor().descriptor,
          relatedMultiSheetEntityKeys: ["crm.account", "crm.lead"],
        },
      })
    );

    render(
      <DataExchangeToolbarActions
        entityKey="crm.lead"
        enableMultiSheetMigration={false}
        defaultOpen
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dx-trigger-crm.lead")).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByTestId("dx-import-crm.lead")).toBeTruthy();
    });

    // Multi-sheet migration must be hidden when explicitly disabled
    expect(screen.queryByTestId("dx-multisheet-crm.lead")).toBeNull();
  });

  it("does not show multi-sheet migration if descriptor has single or no related keys", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetEntityDescriptor.mockResolvedValueOnce(
      buildDescriptor({
        canImport: true,
        canExport: true,
        isImportFeatureEnabled: true,
        isExportFeatureEnabled: true,
        descriptor: {
          ...buildDescriptor().descriptor,
          relatedMultiSheetEntityKeys: ["crm.lead"],
        },
      })
    );

    render(
      <DataExchangeToolbarActions
        entityKey="crm.lead"
        defaultOpen
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dx-trigger-crm.lead")).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByTestId("dx-import-crm.lead")).toBeTruthy();
    });

    expect(screen.queryByTestId("dx-multisheet-crm.lead")).toBeNull();
  });

  it("downloads the xlsx template through useDataExchangeToolbarViewModel when clicked", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetEntityDescriptor.mockResolvedValueOnce(
      buildDescriptor({
        canImport: true,
        canExport: true,
        isImportFeatureEnabled: true,
        isExportFeatureEnabled: true,
      })
    );

    render(
      <DataExchangeToolbarActions
        entityKey="crm.lead"
        defaultOpen
      />
    );

    const templateBtn = await waitFor(() => screen.getByTestId("dx-template-crm.lead"));
    fireEvent.click(templateBtn);

    await waitFor(() => {
      expect(mockDownloadTemplateFile).toHaveBeenCalledWith({
        entityKey: "crm.lead",
        format: "xlsx",
        locale: "en",
        multiSheet: false,
      });
    });
  });
});
