import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockPush = vi.fn();
const mockCanAccessPage = vi.fn<(route: string) => boolean>();
const mockFetchWorkspaceMenu = vi.fn<(workspaceKey: string) => Promise<void>>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/hub",
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

vi.mock("@core/providers/navigation-provider", () => ({
  useNavigation: () => ({
    fetchWorkspaceMenu: mockFetchWorkspaceMenu,
  }),
}));

import { useWorkspaceActions } from "../hooks/useWorkspaceActions";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { WorkspaceGroup, type WorkspaceGroupData } from "@core/navigation/domain/entities/WorkspaceGroup";

function makeWorkspaceGroup(
  overrides: Partial<WorkspaceGroupData> & { workspaceKey: string }
): WorkspaceGroup {
  return new WorkspaceGroup({
    workspaceId: overrides.workspaceId ?? `ws-${overrides.workspaceKey}`,
    workspaceKey: overrides.workspaceKey,
    workspaceNameEn: overrides.workspaceNameEn ?? overrides.workspaceKey.toUpperCase(),
    workspaceNameAr: overrides.workspaceNameAr ?? overrides.workspaceKey,
    workspaceIcon: overrides.workspaceIcon ?? "Layers",
    workspaceSortOrder: overrides.workspaceSortOrder ?? 1,
    colorHue: overrides.colorHue ?? 200,
    colorChroma: overrides.colorChroma ?? 0.14,
    workspaceType: overrides.workspaceType ?? "Module",
    menuItems: overrides.menuItems ?? [],
    isLocked: overrides.isLocked ?? false,
    homeRoute: overrides.homeRoute ?? null,
    platformHomeRoute: overrides.platformHomeRoute ?? null,
    effectiveHomeRoute: overrides.effectiveHomeRoute ?? null,
    isPinned: overrides.isPinned ?? false,
    pinSortOrder: overrides.pinSortOrder ?? null,
    contextScope: overrides.contextScope ?? "Both",
    accessibleItemCount: overrides.accessibleItemCount ?? 1,
  });
}

describe("useWorkspaceActions", () => {
  const initialStoreState = useNavigationStore.getState();

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/hub");
    useNavigationStore.setState(
      {
        ...initialStoreState,
        activeWorkspaceKey: null,
        activeRootItemId: null,
        transitionTargetRoute: null,
        workspaces: new Map(),
        workspaceGroups: [],
        workspaceRouteMap: {},
        routesLoaded: true,
        routesError: null,
      },
      true
    );
    mockCanAccessPage.mockReturnValue(true);
    mockFetchWorkspaceMenu.mockResolvedValue(undefined);
  });

  afterEach(() => {
    window.history.pushState({}, "", "/");
    useNavigationStore.setState(initialStoreState, true);
  });

  it("navigates immediately via effectiveHomeRoute while triggering background fetchWorkspaceMenu", async () => {
    useNavigationStore.setState({
      workspaceGroups: [
        makeWorkspaceGroup({
          workspaceKey: "crm",
          homeRoute: "/crm",
          effectiveHomeRoute: "/crm/leads",
        }),
      ],
      workspaceRouteMap: { crm: ["/crm/leads", "/crm/deals"] },
    });

    let resolveMenu!: () => void;
    mockFetchWorkspaceMenu.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveMenu = resolve;
        })
    );

    const { result } = renderHook(() => useWorkspaceActions());

    await act(async () => {
      await result.current.setActiveWorkspace("crm", true);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/crm/leads");
    expect(mockFetchWorkspaceMenu).toHaveBeenCalledWith("crm");
    expect(useNavigationStore.getState().transitionTargetRoute).toBe("/crm/leads");
    expect(useNavigationStore.getState().activeWorkspaceKey).toBe("crm");

    resolveMenu?.();
  });

  it("falls back to bootstrap-hydrated workspaceRouteMap when effectiveHomeRoute is absent or denied by canAccessPage", async () => {
    useNavigationStore.setState({
      workspaceGroups: [
        makeWorkspaceGroup({
          workspaceKey: "crm",
          homeRoute: "/crm",
          effectiveHomeRoute: "/crm",
        }),
      ],
      workspaceRouteMap: { crm: ["/crm", "/crm/leads"] },
    });

    mockCanAccessPage.mockImplementation((route) => route === "/crm/leads");

    const { result } = renderHook(() => useWorkspaceActions());

    await act(async () => {
      await result.current.setActiveWorkspace("crm", true);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/crm/leads");
    expect(useNavigationStore.getState().transitionTargetRoute).toBe("/crm/leads");
  });

  it("awaits fetchWorkspaceMenu when targetRoute is initially null and unhydrated before navigating", async () => {
    useNavigationStore.setState({
      workspaceGroups: [
        makeWorkspaceGroup({
          workspaceKey: "hrms",
          homeRoute: null,
          effectiveHomeRoute: null,
        }),
      ],
      workspaceRouteMap: {},
      routesLoaded: false,
    });

    let resolveFetch!: () => void;
    mockFetchWorkspaceMenu.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveFetch = () => {
            useNavigationStore.setState({
              routesLoaded: true,
              workspaceGroups: [
                makeWorkspaceGroup({
                  workspaceKey: "hrms",
                  homeRoute: null,
                  effectiveHomeRoute: "/hrms/employment-records",
                }),
              ],
              workspaceRouteMap: { hrms: ["/hrms/employment-records"] },
            });
            resolve();
          };
        })
    );

    const { result } = renderHook(() => useWorkspaceActions());

    let pendingCall!: Promise<void>;
    act(() => {
      pendingCall = result.current.setActiveWorkspace("hrms", true);
    });

    // Must NOT have given up or navigated while hydration is still in flight
    expect(mockFetchWorkspaceMenu).toHaveBeenCalledWith("hrms");
    expect(mockPush).not.toHaveBeenCalled();

    await act(async () => {
      resolveFetch();
      await pendingCall;
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/hrms/employment-records");
    expect(useNavigationStore.getState().transitionTargetRoute).toBe(
      "/hrms/employment-records"
    );
  });

  it("cleans up transition state cleanly and stops progress when zero authorized routes remain on /hub", async () => {
    window.history.pushState({}, "", "/hub");
    useNavigationStore.setState({
      workspaceGroups: [
        makeWorkspaceGroup({
          workspaceKey: "hrms",
          homeRoute: null,
          effectiveHomeRoute: null,
        }),
      ],
      workspaceRouteMap: {},
      routesLoaded: false,
    });

    const stopListener = vi.fn();
    window.addEventListener("routing-progress-stop", stopListener);

    mockFetchWorkspaceMenu.mockImplementationOnce(async () => {
      useNavigationStore.setState({
        routesLoaded: true,
        workspaceRouteMap: {},
      });
    });

    const { result } = renderHook(() => useWorkspaceActions());

    await act(async () => {
      await result.current.setActiveWorkspace("hrms", true);
    });

    window.removeEventListener("routing-progress-stop", stopListener);

    expect(useNavigationStore.getState().transitionTargetRoute).toBeNull();
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(stopListener).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears transition state and navigates back to /hub when zero authorized routes remain from another route", async () => {
    window.history.pushState({}, "", "/crm/leads");
    useNavigationStore.setState({
      workspaceGroups: [
        makeWorkspaceGroup({
          workspaceKey: "hrms",
          homeRoute: null,
          effectiveHomeRoute: null,
        }),
      ],
      workspaceRouteMap: {},
      routesLoaded: false,
    });

    mockFetchWorkspaceMenu.mockImplementationOnce(async () => {
      useNavigationStore.setState({
        routesLoaded: true,
        workspaceRouteMap: {},
      });
    });

    const { result } = renderHook(() => useWorkspaceActions());

    await act(async () => {
      await result.current.setActiveWorkspace("hrms", true);
    });

    expect(useNavigationStore.getState().transitionTargetRoute).toBeNull();
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/hub");
  });
});
