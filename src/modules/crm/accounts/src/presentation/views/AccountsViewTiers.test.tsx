import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccountsView } from "./AccountsView";

const mockHandleTierFilterChange = vi.fn();
const mockHandleSearchChange = vi.fn();

const mockVm = {
  state: {
    stage: "success" as const,
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  },
  search: "",
  tierFilter: undefined as string | undefined,
  isCreateOpen: false,
  isSubmitting: false,
  submitError: null,
  setIsCreateOpen: vi.fn(),
  handleSearchChange: mockHandleSearchChange,
  handleTierFilterChange: mockHandleTierFilterChange,
  handlePageChange: vi.fn(),
  handleCreateAccount: vi.fn(),
  lookupCandidateOrganizations: vi.fn(),
  refresh: vi.fn(),
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    currentPage: 1,
    pageSize: 20,
    itemsCount: 0,
    pagesCount: 1,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  },
  searchValue: "",
  selectedItems: [],
  setSelectedItems: vi.fn(),
  isCreateModalOpen: false,
  setIsCreateModalOpen: vi.fn(),
  isEditModalOpen: false,
  setIsEditModalOpen: vi.fn(),
  viewModalOpen: false,
  setViewModalOpen: vi.fn(),
  editingItem: null,
  viewItem: null,
  openEditModal: vi.fn(),
  closeEditModal: vi.fn(),
  openViewModal: vi.fn(),
  closeViewModal: vi.fn(),
  changePage: vi.fn(),
  changePageSize: vi.fn(),
  refreshItems: vi.fn(),
  createItem: vi.fn(),
};

vi.mock("../viewmodels/useAccountsViewModel", () => ({
  useAccountsViewModel: () => mockVm,
}));

vi.mock("../viewmodels/useAccountsCrudColumns", () => ({
  useAccountsCrudColumns: () => [{ key: "displayName", label: "Account" }],
}));

vi.mock("../components/CreateAccountDialog", () => ({
  CreateAccountDialog: () => null,
}));

vi.mock("../components/AccountEditDialog", () => ({
  AccountEditDialog: () => null,
}));

vi.mock("../components/AccountSplitDetail", () => ({
  AccountSplitListItem: () => null,
  AccountSplitDetail: () => null,
}));

vi.mock("@core/data-exchange", () => ({
  DataExchangeToolbarActions: () => null,
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/accounts",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isPlatformSuperAdmin: false,
    isTenantSuperAdmin: false,
    isSuperAdmin: false,
  }),
}));

describe("AccountsView canonical commercial tier filter taxonomy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVm.tierFilter = undefined;
  });

  it("renders the canonical 5-tier filter chips aligned with CrmAccountDataExchangeProvider", () => {
    render(<AccountsView />);

    const allTiersButton = screen.getByRole("button", {
      name: "crmAccounts.filters.allTiers",
    });
    expect(allTiersButton).toBeInTheDocument();
    expect(allTiersButton.className).toContain(
      "border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)]"
    );
    expect(allTiersButton.className).not.toMatch(/nx-[a-z-]+\/\d+/);
    const tierButtonNames = [
      "crmAccounts.filters.allTiers",
      "crmAccounts.tiers.Enterprise",
      "crmAccounts.tiers.Platinum",
      "crmAccounts.tiers.Gold",
      "crmAccounts.tiers.Silver",
      "crmAccounts.tiers.Standard",
    ];
    for (const label of tierButtonNames) {
      expect(
        screen.getByRole("button", { name: label }).className
      ).not.toMatch(/nx-[a-z-]+\/\d+/);
    }
    expect(
      screen.getByRole("button", { name: "crmAccounts.tiers.Enterprise" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "crmAccounts.tiers.Platinum" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "crmAccounts.tiers.Gold" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "crmAccounts.tiers.Silver" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "crmAccounts.tiers.Standard" })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "crmAccounts.tiers.KeyAccount" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "crmAccounts.tiers.Strategic" })
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "crmAccounts.tiers.Platinum" })
    );
    expect(mockHandleTierFilterChange).toHaveBeenCalledWith("Platinum");

    fireEvent.click(
      screen.getByRole("button", { name: "crmAccounts.tiers.Gold" })
    );
    expect(mockHandleTierFilterChange).toHaveBeenCalledWith("Gold");

    fireEvent.click(
      screen.getByRole("button", { name: "crmAccounts.tiers.Silver" })
    );
    expect(mockHandleTierFilterChange).toHaveBeenCalledWith("Silver");
  });
});
