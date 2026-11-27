import type { PasswordPolicyModel } from "@core/common/password-policy";

export interface TenantBrandingData {
  tenantId: string;
  name: string;
  companyName: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  loginHeadline: string | null;
  loginSubtitle: string | null;
  identityProviderMode: string;
  authenticationMode: "Hybrid" | "SsoOnly";
  allowOwnerBreakGlassLocalLogin: boolean;
  status: string | null;
  statusReason: string | null;
  loginBrandingJson: string | null;
  slotConfigJson: string | null;
  dashboardThemeJson: string | null;
  isSafeMode: boolean;
  passwordPolicy?: PasswordPolicyModel | null;
}

export class TenantBranding {
  constructor(private readonly data: TenantBrandingData) {}

  get tenantId() {
    return this.data.tenantId;
  }
  get name() {
    return this.data.name;
  }
  get companyName() {
    return this.data.companyName;
  }
  get logoUrl() {
    return this.data.logoUrl;
  }
  get faviconUrl() {
    return this.data.faviconUrl;
  }
  get primaryColor() {
    return this.data.primaryColor;
  }
  get secondaryColor() {
    return this.data.secondaryColor;
  }
  get loginHeadline() {
    return this.data.loginHeadline;
  }
  get loginSubtitle() {
    return this.data.loginSubtitle;
  }
  get identityProviderMode() {
    return this.data.identityProviderMode;
  }
  get authenticationMode(): "Hybrid" | "SsoOnly" {
    return this.data.authenticationMode ?? "Hybrid";
  }
  get allowOwnerBreakGlassLocalLogin(): boolean {
    return this.data.allowOwnerBreakGlassLocalLogin ?? true;
  }
  get isSsoOnly(): boolean {
    return this.authenticationMode === "SsoOnly";
  }
  get status() {
    return this.data.status;
  }
  get statusReason() {
    return this.data.statusReason;
  }
  get loginBrandingJson() {
    return this.data.loginBrandingJson;
  }
  get slotConfigJson() {
    return this.data.slotConfigJson;
  }
  get dashboardThemeJson() {
    return this.data.dashboardThemeJson;
  }
  get isSafeMode() {
    return this.data.isSafeMode;
  }
  get passwordPolicy(): PasswordPolicyModel | null {
    return this.data.passwordPolicy ?? null;
  }

  get displayName() {
    return this.companyName ?? this.name;
  }

  get isBlocked() {
    return this.status === "suspended" || this.status === "canceled";
  }

  copyWith(updates: Partial<TenantBrandingData>): TenantBranding {
    return new TenantBranding({ ...this.data, ...updates });
  }
}
