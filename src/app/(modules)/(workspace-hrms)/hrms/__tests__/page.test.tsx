import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

const mockReplace = vi.fn();
const mockCanAccessPage = vi.fn<(route: string) => boolean>();
const mockHasRouteAccess = vi.fn<(route: string) => boolean>();

const mockNavState = vi.hoisted(() => ({
  current: {
    routesLoaded: true,
    routesError: null as string | null,
    workspaceGroups: [] as unknown[],
    workspaces: new Map<string, unknown>(),
    workspaceRouteMap: {} as Record<string, string[]>,
    hasRouteAccess: (route: string) => mockHasRouteAccess(route),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: mockCanAccessPage,
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    permissions: [],
    isLoading: false,
  }),
}));

vi.mock("@core/navigation/store/useNavigationStore", () => {
  const hook = (selector?: (s: typeof mockNavState.current) => unknown) =>
    selector ? selector(mockNavState.current) : mockNavState.current;
  return {
    useNavigationStore: Object.assign(hook, {
      getState: () => mockNavState.current,
    }),
  };
});

import HrmsPage from "../page";

describe("/hrms entry page redirector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanAccessPage.mockReturnValue(true);
    mockHasRouteAccess.mockReturnValue(true);
    mockNavState.current = {
      routesLoaded: true,
      routesError: null,
      workspaceGroups: [],
      workspaces: new Map(),
      workspaceRouteMap: {},
      hasRouteAccess: (route: string) => mockHasRouteAccess(route),
    };
  });

  it("redirects to hrms effectiveHomeRoute (/hrms/employment-records) instead of hardcoded /hrms/staff-members", async () => {
    mockCanAccessPage.mockImplementation(
      (route) => route === "/hrms/employment-records" || route === "/hrms"
    );
    mockHasRouteAccess.mockImplementation(
      (route) => route === "/hrms/employment-records"
    );
    mockNavState.current.workspaceGroups = [
      {
        workspaceKey: "hrms",
        labelEn: "HRMS",
        labelAr: "الموارد البشرية",
        icon: "Users",
        accentColor: "#38bdf8",
        order: 3,
        homeRoute: null,
        platformHomeRoute: null,
        effectiveHomeRoute: "/hrms/employment-records",
        menuItems: [],
      },
    ];
    mockNavState.current.workspaceRouteMap = {
      hrms: ["/hrms/employment-records"],
    };

    render(<HrmsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/hrms/employment-records");
    });
    expect(mockReplace).not.toHaveBeenCalledWith("/hrms/staff-members");
  });

  it("falls back to first accessible leaf in workspaces.get('hrms') / workspaceRouteMap['hrms'] including /work-items", async () => {
    mockCanAccessPage.mockImplementation(
      (route) => route === "/work-items" || route === "/hrms"
    );
    mockHasRouteAccess.mockImplementation((route) => route === "/work-items");
    mockNavState.current.workspaceGroups = [
      {
        workspaceKey: "hrms",
        labelEn: "HRMS",
        labelAr: "الموارد البشرية",
        icon: "Users",
        accentColor: "#38bdf8",
        order: 3,
        homeRoute: null,
        platformHomeRoute: null,
        effectiveHomeRoute: null,
        menuItems: [],
      },
    ];
    mockNavState.current.workspaces = new Map([
      [
        "hrms",
        {
          menuItems: [
            {
              id: "hrms-staff",
              href: "/hrms/staff-members",
              order: 1,
            },
            {
              id: "hrms-work-items",
              href: "/work-items",
              order: 2,
            },
          ],
        },
      ],
    ]);
    mockNavState.current.workspaceRouteMap = {
      hrms: ["/work-items"],
    };

    render(<HrmsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/work-items");
    });
  });

  it("fails closed to /not-authorized for callers with zero accessible HRMS routes", async () => {
    mockCanAccessPage.mockReturnValue(false);
    mockHasRouteAccess.mockReturnValue(false);
    mockNavState.current.workspaceGroups = [
      {
        workspaceKey: "hrms",
        labelEn: "HRMS",
        labelAr: "الموارد البشرية",
        icon: "Users",
        accentColor: "#38bdf8",
        order: 3,
        homeRoute: null,
        platformHomeRoute: null,
        effectiveHomeRoute: null,
        menuItems: [],
      },
    ];
    mockNavState.current.workspaceRouteMap = {
      crm: ["/crm/leads"],
    };

    render(<HrmsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/not-authorized");
    });
    expect(mockReplace).not.toHaveBeenCalledWith("/crm/leads");
    expect(mockReplace).not.toHaveBeenCalledWith("/hrms/staff-members");
  });
});
