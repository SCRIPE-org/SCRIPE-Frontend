import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TooltipProvider } from "@core/ui/tooltip";
import { TopbarContextPill } from "@core/ui/layout/shared";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { TopbarBreadcrumbs } from "../_parts/topbar-parts";
import { NexusTopbar } from "../nexus-topbar";

let mockPathname = "/overview";
let mockLanguage = "en";
let mockDirection: "ltr" | "rtl" = "ltr";
let mockActiveWorkspace: WorkspaceGroup | null = null;
const mockRouterPush = vi.fn();
const mockTranslate = vi.fn((k: string, params?: Record<string, string | number>) => {
  if (k === "chrome.workspaceStartPageTooltip" && params) {
    return `${params.workspace} start page: ${params.page}`;
  }
  return k;
});
const DEFAULT_ACTIVE_ROOT = {
  id: "root-1",
  slug: "directory",
  order: 1,
  nameEn: "Directory",
  nameAr: "دليل",
};
let mockActiveRootItem: typeof DEFAULT_ACTIVE_ROOT | MenuItem = DEFAULT_ACTIVE_ROOT;
let mockRootMenuItems: MenuItem[] = [mockActiveRootItem as unknown as MenuItem];

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    workspaceGroups: mockActiveWorkspace ? [mockActiveWorkspace] : [],
    rootMenuItems: mockRootMenuItems,
    setActiveRootItemId: vi.fn(),
    activeWorkspace: mockActiveWorkspace,
    activeRootItem: mockActiveRootItem,
  }),
}));

vi.mock("@core/providers/workspace-transition-provider", () => ({
  useWorkspaceTransitionContext: () => ({
    switchWorkspace: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    cardStyle: "default",
    showBreadcrumbs: true,
    stickyHeader: true,
    collapsibleSidebar: true,
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: mockLanguage,
    direction: mockDirection,
    t: (k: string, params?: Record<string, string | number>) => mockTranslate(k, params),
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
    hasPermission: () => false,
  }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    activeTenantName: "Al-Ahly Sporting Club",
    isPlatform: false,
  }),
}));

vi.mock("@core/components/tenant-context", () => ({
  TenantContextSwitcherDialog: () => null,
}));

vi.mock("@core/ui/layout/common", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
  NxThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: () => mockPathname,
}));

vi.mock("@core/store", () => ({
  useAppStore: (fn: (s: { tenantCode: string }) => unknown) => fn({ tenantCode: "DEMO" }),
}));

describe("TopbarBreadcrumbs Deduplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/overview";
    mockLanguage = "en";
    mockDirection = "ltr";
    mockActiveWorkspace = null;
    mockActiveRootItem = DEFAULT_ACTIVE_ROOT;
    mockRootMenuItems = [DEFAULT_ACTIVE_ROOT as unknown as MenuItem];
    mockTranslate.mockImplementation((k: string, params?: Record<string, string | number>) => {
      if (k === "chrome.workspaceStartPageTooltip" && params) {
        return `${params.workspace} start page: ${params.page}`;
      }
      return k;
    });
  });
  it("deduplicates consecutive identical segments when workspace, root, and page names are identical", () => {
    render(
      <TopbarBreadcrumbs
        isRTL={false}
        workspaceName="Contacts"
        activeRootName="Contacts"
        displayPageName="Contacts"
      />
    );

    // Should only have 1 "Contacts" text rendered, preventing "Contacts > Contacts > Contacts"
    const contactsElements = screen.getAllByText("Contacts");
    expect(contactsElements).toHaveLength(1);
    expect(screen.queryAllByTestId("breadcrumb-separator")).toHaveLength(0);
  });

  it("deduplicates root segment matching workspace name but displays distinct page name", () => {
    render(
      <TopbarBreadcrumbs
        isRTL={false}
        workspaceName="Contacts"
        activeRootName="Contacts"
        displayPageName="Directory"
      />
    );

    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("Directory")).toBeInTheDocument();
    // Exactly 1 separator between Contacts and Directory
    const separators = screen.getAllByTestId("breadcrumb-separator");
    expect(separators).toHaveLength(1);
  });

  it("deduplicates page segment matching active root name", () => {
    render(
      <TopbarBreadcrumbs
        isRTL={false}
        workspaceName="Workspace"
        activeRootName="Directory"
        displayPageName="Directory"
      />
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    const directoryElements = screen.getAllByText("Directory");
    expect(directoryElements).toHaveLength(1);
    expect(screen.getAllByTestId("breadcrumb-separator")).toHaveLength(1);
  });

  it("renders all distinct segments when names differ", () => {
    render(
      <TopbarBreadcrumbs
        isRTL={false}
        workspaceName="Operations"
        activeRootName="Directory"
        displayPageName="Contact Profile"
      />
    );

    expect(screen.getByText("Operations")).toBeInTheDocument();
    expect(screen.getByText("Directory")).toBeInTheDocument();
    expect(screen.getByText("Contact Profile")).toBeInTheDocument();
    expect(screen.getAllByTestId("breadcrumb-separator")).toHaveLength(2);
  });

  it("uses semantic <nav><ol><li> structure with aria-current='page' on final crumb and rtl:rotate-180 separators", () => {
    render(
      <TopbarBreadcrumbs
        isRTL={true}
        workspaceName="Operations"
        activeRootName="Directory"
        intermediateSegments={["Teams", "Directory", "Academy"]}
        displayPageName="Contact Profile"
      />
    );

    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });
    const list = nav.querySelector("ol");
    expect(list).toBeInTheDocument();

    const items = list!.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(4);

    const currentCrumb = screen.getByText("Contact Profile").closest("[aria-current='page']");
    expect(currentCrumb).not.toBeNull();

    // "Directory" is duplicated across activeRootName and intermediateSegments -> rendered only once
    expect(screen.getAllByText("Directory")).toHaveLength(1);

    const separators = screen.getAllByTestId("breadcrumb-separator");
    for (const sep of separators) {
      expect(sep.getAttribute("class")).toContain("rtl:rotate-180");
    }
  });

  it("prioritizes active leaf crumb with shrink-0 and max-w-[240px] while allowing Level 2 root group to shrink", () => {
    render(
      <TopbarBreadcrumbs
        isRTL={false}
        workspaceName="Administration"
        activeRootName="Management"
        intermediateSegments={["Tenants"]}
        displayPageName="SCRIPE"
      />
    );

    const rootItemLi = screen.getByText("Management").closest("li")!;
    expect(rootItemLi.className).toContain("shrink");
    expect(rootItemLi.className).not.toContain("shrink-0");

    const leafLi = screen.getByText("SCRIPE").closest("li")!;
    expect(leafLi.className).toContain("shrink-0");
    expect(leafLi.className).toContain("max-w-[240px]");
  });

  it("preserves Level-1 brand label without max-w-[116px], bumps chevrons to 32px, and keeps static tenant pill visible on mobile", () => {
    render(
      <>
        <TopbarBreadcrumbs
          isRTL={false}
          workspaceName="SCRIPE"
          activeRootName="Bookings"
          intermediateSegments={[]}
          displayPageName="New Reservation"
        />
        <TopbarContextPill isModuleMode={false} tenantName="Al-Ahly Sporting Club" canSwitchContext={false} />
      </>
    );

    const workspaceBtn = screen.getByText("SCRIPE").closest("button")!;
    const workspaceLi = workspaceBtn.closest("li")!;
    expect(workspaceLi.className).toContain("shrink-0");
    expect(workspaceBtn.className).not.toContain("max-w-[116px]");

    const workspacesChevron = screen.getByRole("button", { name: "navigation.topbar.workspacesMenu" });
    const sectionsChevron = screen.getByRole("button", { name: "navigation.topbar.sectionsMenu" });
    expect(workspacesChevron.className).toContain("h-8");
    expect(workspacesChevron.className).toContain("w-8");
    expect(sectionsChevron.className).toContain("h-8");
    expect(sectionsChevron.className).toContain("w-8");

    const contextPill = screen.getByTestId("topbar-context-pill");
    expect(contextPill.className).toContain("inline-flex");
    expect(contextPill.className).not.toContain("hidden");
    expect(contextPill.className).toContain("max-w-[100px]");
    expect(contextPill.className).toContain("sm:max-w-[160px]");
    expect(within(contextPill).getByText("Al-Ahly Sporting Club").closest("bdi")).not.toBeNull();
  });

  it("renders standard segment formatting in NexusTopbar without obsolete /hub breadcrumb special-casing", () => {
    mockPathname = "/hub";
    render(
      <TooltipProvider>
        <NexusTopbar onMobileMenuOpen={vi.fn()} onTogglePanel={vi.fn()} onOpenSearch={vi.fn()} />
      </TooltipProvider>
    );

    expect(screen.queryByText("workspaceHub.hubTitle")).not.toBeInTheDocument();
    expect(screen.queryByText("chrome.hub")).not.toBeInTheDocument();
    expect(screen.getByText("Hub")).toBeInTheDocument();
  });

  it("unifies TopbarHomeButton and Breadcrumb Level 1 onto effectiveHomeRoute with dynamic localized start-page tooltips", () => {
    const leadsMenu = new MenuItem({
      id: "crm-leads",
      slug: "crm-leads",
      name: "Leads",
      nameEn: "Leads",
      nameAr: "العملاء المحتملون",
      href: "/crm/leads",
      icon: "Users",
      order: 1,
      resource: "crm.leads",
      actions: null,
      children: [],
    });

    mockActiveWorkspace = new WorkspaceGroup({
      workspaceId: "ws-crm",
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة العملاء",
      workspaceIcon: "Briefcase",
      workspaceSortOrder: 2,
      colorHue: 200,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: [leadsMenu],
      isLocked: false,
      homeRoute: "/crm",
      platformHomeRoute: "/overview",
      effectiveHomeRoute: "/crm/leads",
      isPinned: false,
      pinSortOrder: null,
      accessibleItemCount: 2,
    });
    mockRootMenuItems = [leadsMenu];
    mockPathname = "/crm/accounts";

    const { rerender } = render(
      <TooltipProvider>
        <NexusTopbar onMobileMenuOpen={vi.fn()} onTogglePanel={vi.fn()} onOpenSearch={vi.fn()} />
      </TooltipProvider>
    );

    const homeButton = screen.getByRole("button", { name: "CRM start page: Leads" });
    fireEvent.click(homeButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/crm/leads");

    mockRouterPush.mockClear();
    const level1Button = screen.getByRole("button", { name: "CRM" });
    fireEvent.click(level1Button);
    expect(mockRouterPush).toHaveBeenCalledWith("/crm/leads");

    // Hovering/focusing Level 1 displays the localized tooltip with <bdi> isolation
    fireEvent.focus(level1Button);
    const tooltipNodes = screen.getAllByText(
      (_, el) => el?.tagName === "SPAN" && el.textContent === "CRM start page: Leads"
    );
    expect(tooltipNodes.length).toBeGreaterThanOrEqual(1);
    expect(within(tooltipNodes[0]).getByText("CRM").closest("bdi")).not.toBeNull();
    expect(within(tooltipNodes[0]).getByText("Leads").closest("bdi")).not.toBeNull();

    // When already on effectiveHomeRoute (/crm/leads), TopbarHomeButton hides and Level 1 does not re-push
    mockRouterPush.mockClear();
    mockPathname = "/crm/leads";
    rerender(
      <TooltipProvider>
        <NexusTopbar onMobileMenuOpen={vi.fn()} onTogglePanel={vi.fn()} onOpenSearch={vi.fn()} />
      </TooltipProvider>
    );

    expect(screen.queryByRole("button", { name: "CRM start page: Leads" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CRM" }));
    expect(mockRouterPush).not.toHaveBeenCalled();

    // Arabic localization renders Arabic interpolation cleanly
    mockLanguage = "ar";
    mockDirection = "rtl";
    mockPathname = "/crm/accounts";
    mockTranslate.mockImplementation((k: string, params?: Record<string, string | number>) => {
      if (k === "chrome.workspaceStartPageTooltip" && params) {
        return `صفحة بداية ${params.workspace}: ${params.page}`;
      }
      return k;
    });
    rerender(
      <TooltipProvider>
        <NexusTopbar onMobileMenuOpen={vi.fn()} onTogglePanel={vi.fn()} onOpenSearch={vi.fn()} />
      </TooltipProvider>
    );

    expect(
      screen.getByRole("button", { name: "صفحة بداية إدارة العملاء: العملاء المحتملون" })
    ).toBeInTheDocument();
  });

  it("uses server effectiveHomeLabelEn/Ar for TopbarHomeButton and Breadcrumb Level 1 tooltips even when menuItems are unhydrated", () => {
    mockActiveWorkspace = new WorkspaceGroup({
      workspaceId: "ws-crm",
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة العملاء",
      workspaceIcon: "Briefcase",
      workspaceSortOrder: 2,
      colorHue: 200,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: [],
      isLocked: false,
      homeRoute: "/crm",
      platformHomeRoute: null,
      effectiveHomeRoute: "/crm/deals",
      effectiveHomeSource: "PersonalOverride",
      effectiveHomeMenuSlug: "crm-deals",
      effectiveHomeLabelEn: "Open Deals",
      effectiveHomeLabelAr: "الصفقات المفتوحة",
      isPinned: false,
      pinSortOrder: null,
      accessibleItemCount: 2,
    });
    mockRootMenuItems = [];
    mockPathname = "/crm/accounts";

    const { rerender } = render(
      <TooltipProvider>
        <NexusTopbar onMobileMenuOpen={vi.fn()} onTogglePanel={vi.fn()} onOpenSearch={vi.fn()} />
      </TooltipProvider>
    );

    const enHome = screen.getByRole("button", { name: "CRM start page: Open Deals" });
    expect(enHome).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: "CRM" }));
    const enTooltip = screen.getAllByText(
      (_, el) => el?.tagName === "SPAN" && el.textContent === "CRM start page: Open Deals"
    );
    expect(within(enTooltip[0]).getByText("Open Deals").closest("bdi")).not.toBeNull();

    mockLanguage = "ar";
    mockDirection = "rtl";
    mockTranslate.mockImplementation((k: string, params?: Record<string, string | number>) => {
      if (k === "chrome.workspaceStartPageTooltip" && params) {
        return `صفحة بداية ${params.workspace}: ${params.page}`;
      }
      return k;
    });
    rerender(
      <TooltipProvider>
        <NexusTopbar onMobileMenuOpen={vi.fn()} onTogglePanel={vi.fn()} onOpenSearch={vi.fn()} />
      </TooltipProvider>
    );

    expect(
      screen.getByRole("button", { name: "صفحة بداية إدارة العملاء: الصفقات المفتوحة" })
    ).toBeInTheDocument();
  });

  it("localizes /roles/[id] entity detail breadcrumb via navigation.entitySingulars instead of mixed English 'تفاصيل Role'", () => {
    mockPathname = "/roles/8b326564-b61e-4b3b-bd7c-622f4b80196e";
    const rolesRoot = new MenuItem({
      id: "root-admin",
      slug: "roles",
      name: "الأدوار",
      nameEn: "Roles",
      nameAr: "الأدوار",
      href: "/roles",
      icon: "Shield",
      order: 1,
      resource: null,
      actions: null,
      children: [],
    });
    mockActiveRootItem = rolesRoot;
    mockRootMenuItems = [rolesRoot];
    mockLanguage = "ar";
    mockDirection = "rtl";
    mockTranslate.mockImplementation((k: string, params?: Record<string, string | number>) => {
      if (k === "navigation.entitySingulars.roles") return "الدور";
      if (k === "navigation.entityDetailsTitle" && params) {
        return `تفاصيل ${params.entity}`;
      }
      return k;
    });

    render(
      <TooltipProvider>
        <NexusTopbar onMobileMenuOpen={vi.fn()} onTogglePanel={vi.fn()} onOpenSearch={vi.fn()} />
      </TooltipProvider>
    );

    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });
    expect(nav).toHaveTextContent("تفاصيل الدور");
    expect(nav.textContent).not.toContain("تفاصيل Role");
  });
});
