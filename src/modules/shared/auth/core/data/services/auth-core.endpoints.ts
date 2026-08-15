import { V1 } from "@/core/config/api-endpoints/_shared";

export const AUTH_CORE_ENDPOINTS = {
  LOGIN: `${V1}/auth/admin/login`,
  LOGOUT: `${V1}/auth/admin/logout`,
  REFRESH: `${V1}/auth/admin/refresh`,
  ME: `${V1}/Admins/me`,
  IMPERSONATE: (id: string) => `${V1}/auth/admin/impersonate/${id}`,
  STOP_IMPERSONATION: `${V1}/auth/admin/stop-impersonation`,
  // ── Admin Password Reset (targets Admins table, not Users) ──
  ADMIN_REQUEST_PASSWORD_RESET: `${V1}/auth/admin/request-password-reset`,
  ADMIN_VERIFY_RESET_OTP: `${V1}/auth/admin/verify-reset-otp`,
  ADMIN_RESET_PASSWORD: `${V1}/auth/admin/reset-password`,
  // ── Workspace Discovery — returns all tenants for an email ──
  DISCOVER_WORKSPACES: `${V1}/auth/admin/discover-workspaces`,
  TWO_FA: {
    VERIFY: `${V1}/auth/admin/2fa/verify`,
  },
  // ── Passwordless magic-link login ─────────────────────────────
  MAGIC_LINK: {
    REQUEST: `${V1}/auth/magic-link/request`,
    VERIFY: `${V1}/auth/magic-link/verify`,
  },
  OIDC: {
    ADMIN_PROVIDERS: `${V1}/auth/oidc/providers/admin`,
    CHALLENGE: `${V1}/auth/oidc/challenge`,
    CALLBACK: `${V1}/auth/oidc/callback`,
    AUTHORIZE: `/connect/authorize`,
    COMPLETE_WORKSPACE_SELECTION: `${V1}/auth/oidc/complete-workspace-selection`,
  },
  SAML: {
    LOGIN: `${V1}/auth/saml/login`,
    CALLBACK: `${V1}/auth/saml/callback`,
  },
  // ── Passkey / WebAuthn ──
  PASSKEY: {
    REGISTER_BEGIN: `${V1}/auth/passkeys/registration/begin`,
    REGISTER_VERIFY: `${V1}/auth/passkeys/registration/complete`,
    AUTH_BEGIN: `${V1}/auth/passkeys/authentication/begin`,
    AUTH_VERIFY: `${V1}/auth/passkeys/authentication/verify`,
    LIST: `${V1}/auth/passkeys`,
    DELETE: (id: string) => `${V1}/auth/passkeys/${id}`,
  },
  PHONE_OTP: {
    REQUEST: `${V1}/auth/phone-otp/request`,
    VERIFY: `${V1}/auth/phone-otp/verify`,
  },
  QR_LOGIN: {
    CREATE_SESSION: `${V1}/auth/qr-login/session`,
    SESSION_STATUS: (id: string) => `${V1}/auth/qr-login/session/${id}/status`,
    APPROVE: `${V1}/auth/qr-login/approve`,
    REJECT: `${V1}/auth/qr-login/reject`,
  },
  PROFILE: {
    LINK_EXTERNAL_LOGIN: `${V1}/auth/admin/external-logins/link`,
  },
  TENANTS: {
    RESOLVE: `${V1}/customization/resolve`,
  },
} as const;
