import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AccountsView } from "./AccountsView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import type { CrmAccount, PagedAccountsResult } from "../../domain/models/crm-account.types";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";
import { queryClient } from "@core/query-client";
import { CRM_PERMISSIONS } from "@modules/crm";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  }),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/accounts",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AccountsView Component", () => {
  const mockAccounts: CrmAccount[] = [
    {
      id: "acc-001",
      partyId: "party-org-001",
      partyTypeSnapshot: "Organization",
      partyLegalNameEn: "Al Ahly Sporting Club Commercial",
      partyLegalNameAr: "النادي الأهلي التجاري",
      commercialTierCode: "Enterprise",
      preferredCurrencyCode: "EGP",
      ownerUserId: "user-001",
      ownerTeamId: undefined,
      commercialNotes: "Premier tier enterprise account.",
      linkedContactsCount: 3,
      activeOpportunitiesCount: 2,
      rowVersion: "AAAA==",
      createdAt: "2026-10-01T00:00:00Z",
      modifiedAt: "2026-10-05T00:00:00Z",
    },
    {
      id: "acc-002",
      partyId: "party-org-002",
      partyTypeSnapshot: "Organization",
      partyLegalNameEn: "Telecom Egypt Academy Tech",
      partyLegalNameAr: "المصرية للاتصالات",
      commercialTierCode: "Strategic",
      preferredCurrencyCode: "EGP",
      ownerUserId: "user-002",
      ownerTeamId: undefined,
      commercialNotes: "Strategic tech partner.",
      linkedContactsCount: 1,
      activeOpportunitiesCount: 1,
      rowVersion: "BBBB==",
      createdAt: "2026-10-10T00:00:00Z",
      modifiedAt: undefined,
    },
  ];

  let mockContainer: CrmContainer;

  beforeEach(() => {
    queryClient.clear();
    mockContainer = {
      overviewService: {} as any,
      overviewRepository: {
        getOverview: vi.fn().mockResolvedValue({}),
      } as any,
      workflowService: {} as any,
      workflowRepository: {} as any,
      reportsService: {} as any,
      reportsRepository: {} as any,
      settingsService: {} as any,
      settingsRepository: {} as any,
      leadService: {} as any,
      leadRepository: {
        getLeads: vi.fn().mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 20 }),
      } as any,
      opportunityService: {} as any,
      opportunityRepository: {
        getOpportunities: vi.fn().mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 20 }),
      } as any,
      accountService: {} as any,
      accountRepository: {
        getAccounts: vi.fn().mockResolvedValue({
          items: mockAccounts,
          totalCount: 2,
          page: 1,
          pageSize: 20,
        } as PagedAccountsResult),
        getAccountById: vi.fn().mockResolvedValue({
          ...mockAccounts[0],
          contacts: [],
          opportunities: [],
        }),
        createAccount: vi.fn().mockResolvedValue(mockAccounts[0]),
        updateAccount: vi.fn().mockResolvedValue(mockAccounts[0]),
        lookupCandidateParties: vi.fn().mockResolvedValue([]),
      },
      contactService: {} as any,
      contactRepository: {
        getContacts: vi.fn().mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 20 }),
        getContactById: vi.fn(),
        createContact: vi.fn(),
        updateContact: vi.fn(),
      },
      activityService: {} as any,
      activityRepository: {} as any,
      entityLookup: {} as any,
    };

    setCrmContainer(mockContainer);
  });

  it("renders accounts table with commercial tier badges and counts", async () => {
    render(<AccountsView />);

    await waitFor(
      () => {
        expect(screen.getAllByText("Al Ahly Sporting Club Commercial")[0]).toBeDefined();
        expect(screen.getAllByText("Telecom Egypt Academy Tech")[0]).toBeDefined();
      },
      { timeout: 10000 },
    );

    expect(screen.getAllByText("Enterprise").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Strategic").length).toBeGreaterThanOrEqual(1);
  });

  it("enforces ACCOUNTS_READ route permissions in PAGE_PERMISSIONS for list and detail paths", () => {
    expect(PAGE_PERMISSIONS["/crm/accounts"]).toEqual([CRM_PERMISSIONS.ACCOUNTS_READ]);
    expect(PAGE_PERMISSIONS["/crm/accounts/[id]"]).toEqual([CRM_PERMISSIONS.ACCOUNTS_READ]);
  });
});
