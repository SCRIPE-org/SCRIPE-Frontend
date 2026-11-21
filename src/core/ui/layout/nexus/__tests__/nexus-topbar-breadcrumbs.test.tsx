import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TopbarBreadcrumbs, TopbarContextPill } from "../_parts/topbar-parts";

const mockActiveRootItem = {
  id: "root-1",
  slug: "directory",
  order: 1,
  nameEn: "Directory",
  nameAr: "دليل",
};

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    workspaceGroups: [],
    rootMenuItems: [mockActiveRootItem],
    setActiveRootItemId: vi.fn(),
    activeWorkspace: null,
    activeRootItem: mockActiveRootItem,
  }),
}));

vi.mock("@core/providers/workspace-transition-provider", () => ({
  useWorkspaceTransitionContext: () => ({
    switchWorkspace: vi.fn(),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr",
    t: (k: string) => k,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/overview",
}));

vi.mock("@core/store", () => ({
  useAppStore: (fn: (s: { tenantCode: string }) => unknown) => fn({ tenantCode: "DEMO" }),
}));

describe("TopbarBreadcrumbs Deduplication", () => {
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
  });
});
