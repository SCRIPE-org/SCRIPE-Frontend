import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { CustomFieldDetailDialog } from "./CustomFieldDetailDialog";
import { CustomField } from "../../domain/entities/CustomField";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock i18n
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        let str = key;
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
        return str;
      }
      return key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    switchStyle: "default",
    fontSize: "default",
    inputStyle: "default",
    badgeStyle: "default",
  }),
}));

const mockGetById = vi.fn();
const mockGetEntityTypes = vi.fn();
const mockGetByEntityType = vi.fn();

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: () => ({
    customFieldRepository: {
      getById: (...args: unknown[]) => mockGetById(...args),
      getEntityTypes: (...args: unknown[]) => mockGetEntityTypes(...args),
    },
    fieldGroupRepository: {
      getByEntityType: (...args: unknown[]) => mockGetByEntityType(...args),
    },
  }),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderDialog(
  props: Partial<React.ComponentProps<typeof CustomFieldDetailDialog>> = {},
  queryClient = createTestQueryClient()
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <CustomFieldDetailDialog
        open={true}
        onOpenChange={vi.fn()}
        fieldId="field-1"
        fieldLabel="Favorite Color"
        canEdit={true}
        onEdit={vi.fn()}
        {...props}
      />
    </QueryClientProvider>
  );
}

describe("CustomFieldDetailDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEntityTypes.mockResolvedValue([
      {
        key: "party.person",
        owningModule: "party",
        displayNameEn: "Person",
        displayNameAr: "شخص",
      },
      {
        key: "hrms.staff-member",
        owningModule: "hrms",
        displayNameEn: "Staff Member",
        displayNameAr: "موظف",
      },
    ]);
    mockGetByEntityType.mockResolvedValue([
      {
        id: "group-1",
        entityTypeKey: "party.person",
        stableKey: "personal_info",
        labelEn: "Personal Info",
        labelAr: "المعلومات الشخصية",
        sortOrder: 0,
        isGlobal: false,
      },
    ]);
  });

  it("renders loading skeleton while fetching field details", () => {
    mockGetById.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderDialog();

    expect(screen.getByRole("status", { name: "common.loading" })).toBeInTheDocument();
  });

  it("renders error message and retry button when fetching fails", async () => {
    mockGetById.mockRejectedValue(new Error("Network failure"));
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText("customField.details.loadFailed")).toBeInTheDocument();
    });
  });

  it("renders full details for a Text custom field with validator", async () => {
    const textEntity = new CustomField({
      id: "field-text-1",
      entityTypeKey: "party.person",
      key: "national_id",
      labelEn: "National ID",
      labelAr: "الرقم القومي",
      placeholderEn: "Enter your national ID",
      placeholderAr: "أدخل الرقم القومي",
      valueType: "Text",
      isRequired: true,
      isActive: true,
      isGlobal: false,
      sortOrder: 10,
      validatorKind: "EgyptianNationalId",
      validatorParam: null,
      sensitivity: "Confidential",
      isExportable: true,
      fieldGroupId: "group-1",
      createdAt: "2026-08-01T12:00:00Z",
      modifiedAt: "2026-08-05T14:30:00Z",
    });
    mockGetById.mockResolvedValue(textEntity);

    renderDialog({ fieldId: "field-text-1" });

    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: /National ID/i })).toBeInTheDocument();
        expect(screen.getByText("Personal Info")).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Check header labels and key
    expect(screen.getByRole("heading", { name: /National ID/i })).toBeInTheDocument();
    expect(screen.getByText("(الرقم القومي)")).toBeInTheDocument();
    expect(screen.getByText("national_id")).toBeInTheDocument();

    // Check entity type display
    expect(screen.getByText("Person")).toBeInTheDocument();
    expect(screen.getByText("(party.person)")).toBeInTheDocument();

    // Check field group
    expect(screen.getByText("Personal Info")).toBeInTheDocument();

    // Check validator kind fallback string
    expect(screen.getByText("EgyptianNationalId")).toBeInTheDocument();

    // Check sensitivity fallback string
    expect(screen.getAllByText("Confidential")[0]).toBeInTheDocument();

    // Check required indicator
    expect(screen.getAllByText("customField.required")[0]).toBeInTheDocument();
  });

  it("renders options table for a Select field with bilingual options", async () => {
    const selectEntity = new CustomField({
      id: "field-select-1",
      entityTypeKey: "party.person",
      key: "t_shirt_size",
      labelEn: "T-Shirt Size",
      labelAr: "مقاس القميص",
      valueType: "Select",
      isRequired: false,
      isActive: true,
      isGlobal: true,
      sortOrder: 5,
      options: "Small\nMedium\nLarge",
      optionsAr: "صغير\nمتوسط\nكبير",
      sensitivity: "None",
      isExportable: true,
      createdAt: "2026-08-01T12:00:00Z",
    });
    mockGetById.mockResolvedValue(selectEntity);

    renderDialog({ fieldId: "field-select-1" });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /T-Shirt Size/i })).toBeInTheDocument();
    });

    expect(screen.getByText("t_shirt_size")).toBeInTheDocument();

    // Check options rows
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("صغير")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("متوسط")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
    expect(screen.getByText("كبير")).toBeInTheDocument();

    // Check scope
    expect(screen.getAllByText("customField.details.fields.globalScope")[0]).toBeInTheDocument();
  });

  it("renders pinned reference target for an EntityReference field", async () => {
    const refEntity = new CustomField({
      id: "field-ref-1",
      entityTypeKey: "party.person",
      key: "assigned_coach",
      labelEn: "Assigned Coach",
      valueType: "EntityReference",
      isRequired: false,
      isActive: true,
      sortOrder: 20,
      referenceTargetEntityTypeKey: "hrms.staff-member",
      createdAt: "2026-08-01T12:00:00Z",
    });
    mockGetById.mockResolvedValue(refEntity);

    renderDialog({ fieldId: "field-ref-1" });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Assigned Coach/i })).toBeInTheDocument();
    });

    expect(screen.getByText("assigned_coach")).toBeInTheDocument();
    expect(screen.getByText("Staff Member (hrms.staff-member)")).toBeInTheDocument();
  });

  it("calls onEdit when Edit button is clicked", async () => {
    const fieldEntity = new CustomField({
      id: "field-editable-1",
      entityTypeKey: "party.person",
      key: "test_field",
      labelEn: "Test Field",
      valueType: "Text",
      isRequired: false,
      isActive: true,
      sortOrder: 1,
      createdAt: "2026-08-01T12:00:00Z",
    });
    mockGetById.mockResolvedValue(fieldEntity);

    const onEditMock = vi.fn();
    const onOpenChangeMock = vi.fn();

    renderDialog({
      fieldId: "field-editable-1",
      canEdit: true,
      onEdit: onEditMock,
      onOpenChange: onOpenChangeMock,
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Test Field/i })).toBeInTheDocument();
    });

    const editBtn = screen.getByRole("button", { name: /common\.edit/i });
    fireEvent.click(editBtn);

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    expect(onEditMock).toHaveBeenCalledWith(fieldEntity);
  });

  it("closes dialog when Close button is clicked", async () => {
    const fieldEntity = new CustomField({
      id: "field-1",
      entityTypeKey: "party.person",
      key: "test_field",
      labelEn: "Test Field",
      valueType: "Text",
      isRequired: false,
      isActive: true,
      sortOrder: 1,
      createdAt: "2026-08-01T12:00:00Z",
    });
    mockGetById.mockResolvedValue(fieldEntity);

    const onOpenChangeMock = vi.fn();

    renderDialog({
      fieldId: "field-1",
      onOpenChange: onOpenChangeMock,
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Test Field/i })).toBeInTheDocument();
    });

    const closeBtns = screen.getAllByRole("button", { name: /common\.close/i });
    fireEvent.click(closeBtns[0]);

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
  });
});
