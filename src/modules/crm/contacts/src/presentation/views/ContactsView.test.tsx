import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ContactsView } from "./ContactsView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import type { CrmContact, PagedContactsResult } from "../../domain/models/crm-contact.types";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";
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
  usePathname: () => "/crm/contacts",
}));

describe("ContactsView Component", () => {
  const mockContacts: CrmContact[] = [
    {
      id: "cont-001",
      personPartyId: "party-pers-001",
      primaryAccountId: "acc-001",
      primaryAccountNameEn: "Al Ahly Commercial",
      primaryAccountNameAr: "الأهلي التجاري",
      personLegalNameEn: "Mohamed El-Shenawy",
      personLegalNameAr: "محمد الشناوي",
      jobTitleSnapshot: "Commercial Director",
      departmentName: "Sports Marketing",
      ownerUserId: "user-001",
      ownerTeamId: undefined,
      commercialNotes: "Lead executive for sponsorships.",
      email: "m.shenawy@alahly.example",
      phone: "+201012345678",
      rowVersion: "AAAA==",
      createdAt: "2026-10-01T00:00:00Z",
      modifiedAt: undefined,
    },
    {
      id: "cont-002",
      personPartyId: "party-pers-002",
      primaryAccountId: undefined,
      primaryAccountNameEn: undefined,
      primaryAccountNameAr: undefined,
      personLegalNameEn: "Ahmed Sayed",
      personLegalNameAr: "أحمد سيد",
      jobTitleSnapshot: "Procurement Lead",
      departmentName: "Finance & Contracts",
      ownerUserId: "user-002",
      ownerTeamId: undefined,
      commercialNotes: "Unassigned contact.",
      email: "ahmed.s@example.com",
      phone: "+201098765432",
      rowVersion: "BBBB==",
      createdAt: "2026-10-05T00:00:00Z",
      modifiedAt: undefined,
    },
  ];

  let mockContainer: CrmContainer;

  beforeEach(() => {
    mockContainer = {
      overviewService: {} as any,
      overviewRepository: {} as any,
      leadService: {} as any,
      leadRepository: {} as any,
      opportunityService: {} as any,
      opportunityRepository: {} as any,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {
        getContacts: vi.fn().mockResolvedValue({
          items: mockContacts,
          totalCount: 2,
          page: 1,
          pageSize: 20,
        } as PagedContactsResult),
        getContactById: vi.fn().mockResolvedValue({
          ...mockContacts[0],
          opportunities: [],
        }),
        createContact: vi.fn().mockResolvedValue(mockContacts[0]),
        updateContact: vi.fn().mockResolvedValue(mockContacts[0]),
      },
    };

    setCrmContainer(mockContainer);
  });

  it("renders contacts table with stakeholder names and roles", async () => {
    render(<ContactsView />);

    await waitFor(() => {
      expect(screen.getByText("Mohamed El-Shenawy")).toBeDefined();
      expect(screen.getByText("Ahmed Sayed")).toBeDefined();
    });

    expect(screen.getByText("Commercial Director")).toBeDefined();
    expect(screen.getByText("Al Ahly Commercial")).toBeDefined();
  });

  it("enforces CONTACTS_READ route permissions in PAGE_PERMISSIONS for list and detail paths", () => {
    expect(PAGE_PERMISSIONS["/crm/contacts"]).toEqual([CRM_PERMISSIONS.CONTACTS_READ]);
    expect(PAGE_PERMISSIONS["/crm/contacts/[id]"]).toEqual([CRM_PERMISSIONS.CONTACTS_READ]);
  });
});
