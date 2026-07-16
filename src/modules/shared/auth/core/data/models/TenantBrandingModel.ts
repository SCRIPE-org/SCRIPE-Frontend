export interface TenantBrandingModel {
  tenantId?: string | null;
  name?: string | null;
  companyName?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  loginHeadline?: string | null;
  loginSubtitle?: string | null;
  identityProviderMode?: string | null;
  status?: string | null;
  statusReason?: string | null;
  loginBrandingJson?: string | null;
  slotConfigJson?: string | null;
  dashboardThemeJson?: string | null;
  isSafeMode?: boolean | null;
}
