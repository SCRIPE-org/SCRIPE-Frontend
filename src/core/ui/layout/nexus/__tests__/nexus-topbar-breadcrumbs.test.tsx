import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TopbarBreadcrumbs } from "../_parts/topbar-parts";

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
});
