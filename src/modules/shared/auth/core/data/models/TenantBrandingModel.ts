import type { PasswordPolicyDto } from "@core/common/password-policy";

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
  authenticationMode?: "Hybrid" | "SsoOnly" | string | number | null;
  allowOwnerBreakGlassLocalLogin?: boolean | null;
  status?: string | null;
  statusReason?: string | null;
  loginBrandingJson?: string | null;
  slotConfigJson?: string | null;
  dashboardThemeJson?: string | null;
  isSafeMode?: boolean | null;
  passwordPolicy?: PasswordPolicyDto | null;
}
