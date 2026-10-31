import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LeadsView } from "./LeadsView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import type { CrmLead, PagedLeadsResult } from "../../domain/models/crm-lead.types";

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
      overviewRepository: {
        getOverviewSummary: vi.fn().mockResolvedValue({
          pipelineMetrics: {
            totalPipelineValue: 0,
            formattedTotalValue: "SAR 0",
            totalDeals: 0,
            averageDealSize: 0,
            winRatePercentage: 0,
            stageCounts: {
              discovery: 0,
              qualification: 0,
              solutionFit: 0,
              proposal: 0,
              negotiation: 0,
            },
          },
          recentDeals: [],
          upcomingActions: [],
        }),
      } as any,
      leadService: {} as any,
      leadRepository: {
        getLeads: mockGetLeads as any,
        getLeadById: vi.fn(),
        createLead: mockCreateLead as any,
        qualifyLead: mockQualifyLead as any,
        linkParty: mockLinkParty as any,
        convertLead: mockConvertLead as any,
      },
    };

    setCrmContainer(mockContainer);
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

  it("opens the create lead dialog when '+ New Lead' is clicked", async () => {
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
    const cardGridButton = screen.getByText("CardGrid");
    fireEvent.click(cardGridButton);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Hilal Season Ticket Partnership")[0]).toBeDefined();
    });

    // Switch to SplitPane mode
    const splitPaneButton = screen.getByText("SplitPane");
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
    const cardGridButton = screen.getByText("CardGrid");
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

    const cardGridButton = screen.getByText("CardGrid");
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

    const cardGridButton = screen.getByText("CardGrid");
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
});
