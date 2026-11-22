/**
 * LandingTargetCatalogDto — Raw API Envelope & Payload Shapes
 *
 * Returned by `GET /menus/navigation/landing-targets[?scopeMode=...]`.
 */

export interface LandingTargetWorkspaceDto {
  workspaceKey?: string;
  workspaceNameEn?: string;
  workspaceNameAr?: string;
  workspaceIcon?: string | null;
  workspaceSortOrder?: number;
  workspaceType?: string;
  contextScope?: string;
  effectiveHomeRoute?: string | null;
}

export interface LandingTargetCatalogItemDto {
  workspaceKey?: string;
  workspaceNameEn?: string;
  workspaceNameAr?: string;
  contextScope?: string;
  slug?: string;
  nameEn?: string;
  nameAr?: string;
  route?: string;
  breadcrumbEn?: string[];
  breadcrumbAr?: string[];
}

export interface LandingTargetCatalogDataDto {
  scopeMode?: string;
  contextKey?: string;
  overviewAuthorized?: boolean;
  workspaces?: LandingTargetWorkspaceDto[];
  items?: LandingTargetCatalogItemDto[];
}

export interface LandingTargetCatalogResponseDto {
  statusCode?: number;
  message?: string;
  data?: LandingTargetCatalogDataDto;
  errors?: unknown;
}
