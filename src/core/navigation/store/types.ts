import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import type { MenuItem, MenuItemActions } from "@core/navigation/domain/entities/MenuItem";
import type {
  AuthorizedRouteDescriptor,
  BootstrapNavigationResult,
  LandingResolution,
  RouteAccessState,
} from "@core/navigation/domain/interfaces/INavigationRepository";

export type { AuthorizedRouteDescriptor, BootstrapNavigationResult, LandingResolution, RouteAccessState };
export type WorkspaceRouteMap = Record<string, string[]>;

export interface SetRouteDataInput {
  routes: string[];
  workspaceRouteMap: WorkspaceRouteMap;
  routeDescriptors: AuthorizedRouteDescriptor[];
  contextKey: string;
}

export interface RouteSlice {
  allRoutes: Set<string>;
  allRoutesSorted: string[];
  workspaceRouteMap: WorkspaceRouteMap;
  routeDescriptors: Map<string, AuthorizedRouteDescriptor>;
  routesLoaded: boolean;
  routesContextKey: string | null;
  routesError: string | null;
  routesLoadedAt: number | null;
  contextKey: string;
  landingResolution: LandingResolution | null;

  setRouteData: (input: SetRouteDataInput) => void;
  setRoutesError: (message: string, contextKey?: string | null) => void;
  clearRouteData: () => void;
  isNavSyncedForContext: (expectedContextKey?: string | null) => boolean;
  getRouteDescriptor: (pathname: string) => AuthorizedRouteDescriptor | null;
  hasRouteAccess: (pathname: string) => boolean;
}

export interface WorkspaceSlice {
  workspaceGroups: WorkspaceGroup[];
  workspaces: Map<string, NavigationData>;
  defaultWorkspace: NavigationData | null;
  recentWorkspaceKeysByContext: Record<string, string[]>;

  initializeBootstrap: (result: BootstrapNavigationResult, contextKey: string) => void;
  initializeDefaultWorkspace: (data: NavigationData, groups: WorkspaceGroup[]) => void;
  setWorkspaceData: (key: string, data: NavigationData) => void;
  hasWorkspaceData: (key: string) => boolean;
  recordRecentWorkspace: (contextKey: string, workspaceKey: string) => void;
  clearRecentWorkspaces: () => void;

  getActiveWorkspaceGroup: () => WorkspaceGroup | null;
  getActiveRootMenuItems: () => MenuItem[];
  getPageActions: (pathname: string) => MenuItemActions | null;

  /**
   * Optimistically toggle the isPinned / pinSortOrder of a workspace group.
   * Called AFTER the API confirms the new state — updates Zustand in-memory.
   */
  toggleWorkspacePinLocal: (
    workspaceKey: string,
    isPinned: boolean,
    pinSortOrder: number | null
  ) => void;
}

export interface UiSlice {
  activeWorkspaceKey: string | null;
  activeRootItemId: string | null;
  previousWorkspaceKey: string | null;
  isInitialLoading: boolean;
  isWorkspaceSwitching: boolean;
  transitionTargetRoute: string | null; // Track target route during JIT workspace transitions

  breadcrumbOverride: string | null;
  setBreadcrumbOverride: (title: string | null) => void;
  setActiveWorkspace: (key: string | null) => void;
  setActiveRootItem: (id: string | null) => void;
  setPreviousWorkspace: (key: string | null) => void;
  setIsInitialLoading: (loading: boolean) => void;
  setIsWorkspaceSwitching: (loading: boolean) => void;
  setTransitionTargetRoute: (route: string | null) => void;

  getActiveRootItem: () => MenuItem | null;

  reset: () => void;
}

export type NavigationStoreState = RouteSlice & WorkspaceSlice & UiSlice;
