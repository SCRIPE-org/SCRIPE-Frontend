import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { LeadsView } from "./LeadsView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import type { CrmLead, PagedLeadsResult } from "../../domain/models/crm-lead.types";
import { queryClient } from "@core/query-client";

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
  usePathname: () => "/crm/leads",
  useSearchParams: () => new URLSearchParams(),
}));

describe("LeadsView Component", () => {
  const mockLeads: CrmLead[] = [
    {
      id: "lead-001",
      title: "Al-Hilal Season Ticket Partnership",
      firstName: "Fahad",
      lastName: "Al-Otaibi",
      fullName: "Fahad Al-Otaibi",
      companyName: "Al-Hilal Sports Club",
      email: "fahad@alhilal.sa",
      phone: "+966501112233",
      status: "New",
      statusName: "New",
      source: "Inbound",
      estimatedValue: 450000,
      currency: "SAR",
      createdAt: "2026-10-30T00:00:00Z",
    },
    {
      id: "lead-002",
      title: "Riyadh Academy Fleet Deal",
      firstName: "Sara",
      lastName: "Al-Dosari",
      fullName: "Sara Al-Dosari",
      companyName: "Riyadh Elite Academy",
      email: "sara@riyadhelite.sa",
      status: "Working",
      statusName: "Working",
      source: "Referral",
      estimatedValue: 180000,
      currency: "SAR",
      createdAt: "2026-10-29T12:00:00Z",
    },
    {
      id: "lead-003",
      title: "Jeddah Club Facility Deal",
      firstName: "Omar",
      lastName: "Al-Harbi",
      fullName: "Omar Al-Harbi",
      companyName: "Jeddah Club",
      email: "omar@jeddah.sa",
      status: "Qualified",
      statusName: "Qualified",
      source: "Partner",
      estimatedValue: 250000,
      currency: "SAR",
      createdAt: "2026-10-28T09:00:00Z",
    },
  ];

  let mockGetLeads: ReturnType<typeof vi.fn>;
  let mockCreateLead: ReturnType<typeof vi.fn>;
  let mockQualifyLead: ReturnType<typeof vi.fn>;
  let mockLinkParty: ReturnType<typeof vi.fn>;
  let mockConvertLead: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockGetLeads = vi.fn().mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    } as PagedLeadsResult);

    mockCreateLead = vi.fn().mockResolvedValue({
      id: "lead-new",
      title: "Test Lead",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      status: "New",
      statusName: "New",
      currency: "SAR",
      createdAt: new Date().toISOString(),
    } as CrmLead);

    mockQualifyLead = vi.fn().mockResolvedValue({
      id: "lead-1",
      status: "Qualified",
    } as any);
    mockLinkParty = vi.fn().mockResolvedValue({
      id: "lead-1",
      organizationPartyId: "org-1",
    } as any);
    mockConvertLead = vi.fn().mockResolvedValue({
      opportunityId: "opp-123",
      accountId: "acc-123",
      contactId: "cnt-123",
      redirectUrl: "/crm/opportunities/opp-123",
    });

    const mockContainer: CrmContainer = {
      overviewService: {} as any,
      overviewRepository: {} as any,

      workflowService: {} as never,

      workflowRepository: {} as never,
      reportsService: {} as any,
      reportsRepository: {} as any,
      settingsService: {} as any,
      settingsRepository: {} as any,
      leadService: {} as any,
      leadRepository: {
        getLeads: mockGetLeads as any,
        getLeadById: vi.fn(),
        createLead: mockCreateLead as any,
        updateLead: vi.fn().mockResolvedValue({ id: "lead-002", status: "New" }),
        qualifyLead: mockQualifyLead as any,
        linkParty: mockLinkParty as any,
        convertLead: mockConvertLead as any,
      } as any,
      opportunityService: {} as any,
      opportunityRepository: {} as any,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
      activityService: {} as any,
      activityRepository: {} as any,
      entityLookup: {} as any,
    };

    setCrmContainer(mockContainer);
  });

  afterEach(async () => {
    try {
      const { useCrmClientPrefsStore } = await import("@modules/crm");
      useCrmClientPrefsStore.getState().setDefaultDealViewMode("Table");
    } catch { /* noop */ }
  });

  it("renders the Leads View shell, header, and search bar", async () => {
    render(<LeadsView />);

    expect(screen.getByText("crmLeads.title")).toBeDefined();
    expect(screen.getByText("crmLeads.subtitle")).toBeDefined();
    expect(screen.getByPlaceholderText("crmLeads.actions.searchPlaceholder")).toBeDefined();
    expect(screen.getByText("crmLeads.actions.newLead")).toBeDefined();
  });

  it("displays empty state when there are zero leads", async () => {
    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("crmLeads.table.emptyTitle")[0]).toBeDefined();
    });
  });

  it("displays leads table with real data when leads exist", async () => {
    mockGetLeads.mockResolvedValue({
      items: mockLeads,
      totalCount: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
      expect(screen.getAllByText("Fahad Al-Otaibi")[0]).toBeDefined();
      expect(screen.getAllByText("Riyadh Academy Fleet Deal")[0]).toBeDefined();
      expect(screen.getAllByText("Sara Al-Dosari")[0]).toBeDefined();
    });
  });

  it("opens the create lead dialog when 'New Lead' is clicked", async () => {
    render(<LeadsView />);

    const newLeadButton = screen.getByText("crmLeads.actions.newLead");
    fireEvent.click(newLeadButton);

    await waitFor(() => {
      expect(screen.getByText("crmLeads.dialog.title")).toBeDefined();
    });
  });

  it("allows switching view mode to Kanban, CardGrid, and SplitPane", async () => {
    mockGetLeads.mockResolvedValue({
      items: mockLeads,
      totalCount: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    // Switch to Kanban mode
    const kanbanButton = screen.getByText("Kanban");
    fireEvent.click(kanbanButton);

    await waitFor(() => {
      expect(screen.getAllByText("crmLeads.status.new")[0]).toBeDefined();
      expect(screen.getAllByText("crmLeads.status.working")[0]).toBeDefined();
      expect(screen.getAllByText("crmLeads.status.qualified")[0]).toBeDefined();
    });

    // Switch to CardGrid mode
    const cardGridButton = screen.getByText(/Card\s*Grid/i);
    fireEvent.click(cardGridButton);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    // Switch to SplitPane mode
    const splitPaneButton = screen.getByText(/Split\s*Pane/i);
    fireEvent.click(splitPaneButton);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
      expect(screen.getByText("Estimated Commercial Value")).toBeDefined();
    });
  });

  it("renders row action buttons for qualify, party linking, and conversion", async () => {
    mockGetLeads.mockResolvedValue({
      items: mockLeads,
      totalCount: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    // Switch to CardGrid mode where action buttons are rendered
    const cardGridButton = screen.getByText(/Card\s*Grid/i);
    fireEvent.click(cardGridButton);

    await waitFor(() => {
      // Qualify and Link Party should be visible for non-qualified leads
      expect(screen.getAllByText("crmLeads.actions.qualify").length).toBeGreaterThan(0);
      expect(screen.getAllByText("crmLeads.actions.linkParty").length).toBeGreaterThan(0);
      // Convert action should be visible for Qualified lead (lead-003)
      expect(screen.getAllByText("crmLeads.actions.convert").length).toBeGreaterThan(0);
    });

    // Click Qualify button to open dialog
    const qualifyButtons = screen.getAllByText("crmLeads.actions.qualify");
    fireEvent.click(qualifyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("crmLeads.qualification.dialogTitle")).toBeDefined();
    });

    const saveQualifyBtn = screen.getByText("crmLeads.qualification.save");
    fireEvent.click(saveQualifyBtn);

    await waitFor(() => {
      expect(mockQualifyLead).toHaveBeenCalled();
    });
  });

  it("opens LinkPartyDialog and calls linkParty on submit", async () => {
    mockGetLeads.mockResolvedValue({
      items: mockLeads,
      totalCount: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    const cardGridButton = screen.getByText(/Card\s*Grid/i);
    fireEvent.click(cardGridButton);

    await waitFor(() => {
      expect(screen.getAllByText("crmLeads.actions.linkParty").length).toBeGreaterThan(0);
    });

    const linkButtons = screen.getAllByText("crmLeads.actions.linkParty");
    fireEvent.click(linkButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("crmLeads.partyLink.dialogTitle")).toBeDefined();
    });

    const saveLinkBtn = screen.getByText("crmLeads.partyLink.save");
    fireEvent.click(saveLinkBtn);

    await waitFor(() => {
      expect(mockLinkParty).toHaveBeenCalled();
    });
  });

  it("opens ConvertLeadDialog and calls convertLead on submit", async () => {
    mockGetLeads.mockResolvedValue({
      items: mockLeads,
      totalCount: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    const cardGridButton = screen.getByText(/Card\s*Grid/i);
    fireEvent.click(cardGridButton);

    await waitFor(() => {
      expect(screen.getAllByText("crmLeads.actions.convert").length).toBeGreaterThan(0);
    });

    const convertButtons = screen.getAllByText("crmLeads.actions.convert");
    fireEvent.click(convertButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("crmLeads.conversion.dialogTitle")).toBeDefined();
    });

    const submitConvertBtn = screen.getByText("crmLeads.conversion.convert");
    fireEvent.click(submitConvertBtn);

    await waitFor(() => {
      expect(mockConvertLead).toHaveBeenCalled();
    });
  });

  it("supports Kanban stage step buttons to roll back Working lead to New and advance Qualified lead to Convert dialog", async () => {
    mockGetLeads.mockResolvedValue({
      items: mockLeads,
      totalCount: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    const kanbanButton = screen.getByText("Kanban");
    fireEvent.click(kanbanButton);

    await waitFor(() => {
      expect(screen.getByTitle("Move back to New")).toBeDefined();
      expect(screen.getByTitle("Advance to Converted")).toBeDefined();
    });

    // Clicking "Advance to Converted" on a Qualified lead opens the ConvertLeadDialog
    fireEvent.click(screen.getByTitle("Advance to Converted"));
    await waitFor(() => {
      expect(screen.getByText("crmLeads.conversion.dialogTitle")).toBeDefined();
    });
  });

  it("allows rolling back a Converted lead when deal is unprogressed and renders error banner when deal has progressed", async () => {
    const convertedLead: CrmLead = {
      id: "lead-conv-1",
      title: "Converted Stadium Lead",
      firstName: "Khalid",
      lastName: "Al-Saud",
      fullName: "Khalid Al-Saud",
      companyName: "Riyadh Arena Co",
      status: "Converted",
      statusName: "Converted",
      convertedOpportunityId: "opp-init-1",
      estimatedValue: 300000,
      currency: "SAR",
      rowVersion: "AAAA==",
      createdAt: "2026-10-30T00:00:00Z",
    };

    mockGetLeads.mockResolvedValue({
      items: [convertedLead],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    const mockUpdateLead = vi
      .fn()
      .mockRejectedValueOnce(
        new Error(
          "Cannot revert lead from Converted because the linked deal 'Riyadh Arena Deal' has already progressed to stage 'Proposal' (Open)."
        )
      )
      .mockResolvedValueOnce({ ...convertedLead, status: "Qualified", convertedOpportunityId: undefined });

    setCrmContainer({
      overviewService: {} as any,
      overviewRepository: {} as any,

      workflowService: {} as never,

      workflowRepository: {} as never,
      reportsService: {} as any,
      reportsRepository: {} as any,
      settingsService: {} as any,
      settingsRepository: {} as any,
      leadService: {} as any,
      leadRepository: {
        getLeads: mockGetLeads as any,
        getLeadById: vi.fn(),
        createLead: mockCreateLead as any,
        updateLead: mockUpdateLead as any,
        qualifyLead: mockQualifyLead as any,
        linkParty: mockLinkParty as any,
        convertLead: mockConvertLead as any,
      } as any,
      opportunityService: {} as any,
      opportunityRepository: {} as any,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
      activityService: {} as any,
      activityRepository: {} as any,
      entityLookup: {} as any,
    });

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Converted Stadium Lead")[0]).toBeDefined();
    });

    fireEvent.click(screen.getByText("Kanban"));

    await waitFor(() => {
      expect(screen.getByTitle("Move back to Qualified")).toBeDefined();
    });

    // Attempt 1: Deal has progressed -> shows destructive error banner
    fireEvent.click(screen.getByTitle("Move back to Qualified"));

    await waitFor(() => {
      expect(screen.getByTestId("leads-transition-error-banner")).toBeDefined();
      expect(
        screen.getByText(/Cannot revert lead from Converted because the linked deal/i)
      ).toBeDefined();
    });

    // Dismiss error banner
    fireEvent.click(screen.getByText("Dismiss"));
    await waitFor(() => {
      expect(screen.queryByTestId("leads-transition-error-banner")).toBeNull();
    });

    // Attempt 2: Deal is in initial Discovery stage -> succeeds and reverts to Qualified
    fireEvent.click(screen.getByTitle("Move back to Qualified"));
    await waitFor(() => {
      expect(mockUpdateLead).toHaveBeenCalledWith(
        expect.objectContaining({
          leadId: "lead-conv-1",
          targetStatus: "Qualified",
        })
      );
    });
  });

  it("renders Kanban view by default when defaultDealViewMode is set to Kanban in CRM Settings", async () => {
    const { useCrmClientPrefsStore } = await import("@modules/crm");
    useCrmClientPrefsStore.getState().setDefaultDealViewMode("Kanban");

    mockGetLeads.mockResolvedValue({
      items: mockLeads,
      totalCount: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    } as PagedLeadsResult);

    render(<LeadsView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    // Should render Kanban columns by default
    expect(screen.getAllByText("crmLeads.status.new")[0]).toBeDefined();
    expect(screen.getAllByText("crmLeads.status.working")[0]).toBeDefined();

    // Reset back to Table
    useCrmClientPrefsStore.getState().setDefaultDealViewMode("Table");
  });
});
