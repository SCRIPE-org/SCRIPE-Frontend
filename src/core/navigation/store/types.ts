import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import type { MenuItem, MenuItemActions } from "@core/navigation/domain/entities/MenuItem";

export type WorkspaceRouteMap = Record<string, string[]>;

export interface RouteSlice {
  allRoutes: Set<string>;
  allRoutesSorted: string[];
  workspaceRouteMap: WorkspaceRouteMap;
  routesLoadedAt: number | null;
  contextKey: string;

  initializeRoutes: (
    routes: string[],
    workspaceRouteMap: WorkspaceRouteMap,
    contextKey: string
  ) => void;
  hasRouteAccess: (pathname: string) => boolean;
}

export interface WorkspaceSlice {
  workspaceGroups: WorkspaceGroup[];
  workspaces: Map<string, NavigationData>;
  defaultWorkspace: NavigationData | null;

  initializeDefaultWorkspace: (
    data: NavigationData,
    groups: WorkspaceGroup[]
  ) => void;
  setWorkspaceData: (key: string, data: NavigationData) => void;
  hasWorkspaceData: (key: string) => boolean;
  
  getActiveWorkspaceGroup: () => WorkspaceGroup | null;
  getActiveRootMenuItems: () => MenuItem[];
  getPageActions: (pathname: string) => MenuItemActions | null;
}

export interface UiSlice {
  activeWorkspaceKey: string | null;
  activeRootItemId: string | null;
  previousWorkspaceKey: string | null;
  isInitialLoading: boolean;
  isWorkspaceSwitching: boolean;

  setActiveWorkspace: (key: string | null) => void;
  setActiveRootItem: (id: string | null) => void;
  setPreviousWorkspace: (key: string | null) => void;
  setIsInitialLoading: (loading: boolean) => void;
  setIsWorkspaceSwitching: (loading: boolean) => void;
  
  getActiveRootItem: () => MenuItem | null;
  
  reset: () => void;
}

export type NavigationStoreState = RouteSlice & WorkspaceSlice & UiSlice;
