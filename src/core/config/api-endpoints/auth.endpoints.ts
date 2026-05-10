import { V1 } from "./_shared";

export const AUTH_ENDPOINTS = {
  AUTH: {
    LOGIN: `${V1}/auth/admin/login`,
    LOGOUT: `${V1}/auth/admin/logout`,
    REFRESH: `${V1}/auth/admin/refresh`,
    ME: `${V1}/auth/admin/me`,
    IMPERSONATE: (id: string) => `${V1}/auth/admin/impersonate/${id}`,
    STOP_IMPERSONATION: `${V1}/auth/admin/stop-impersonation`,
    // ── Admin Password Reset (targets Admins table, not Users) ──
    ADMIN_REQUEST_PASSWORD_RESET: `${V1}/auth/admin/request-password-reset`,
    ADMIN_RESET_PASSWORD: `${V1}/auth/admin/reset-password`,
    // ── Workspace Discovery — returns all tenants for an email ──
    DISCOVER_WORKSPACES: `${V1}/auth/admin/discover-workspaces`,
    TWO_FA: {
      ENABLE: `${V1}/auth/admin/2fa/enable`,
      CONFIRM: `${V1}/auth/admin/2fa/confirm`,
      VERIFY: `${V1}/auth/admin/2fa/verify`,
      DISABLE: `${V1}/auth/admin/2fa/disable`,
    },
    OIDC: {
      ADMIN_PROVIDERS: `${V1}/auth/oidc/providers/admin`,
      CHALLENGE: `${V1}/auth/oidc/challenge`,
      CALLBACK: `${V1}/auth/oidc/callback`,
      AUTHORIZE: `/connect/authorize`,
    },
    SAML: {
      LOGIN: `${V1}/auth/saml/login`,
    },
  },

  ACCOUNT_SETUP: {
    VALIDATE_TOKEN: (token: string) =>
      `${V1}/account-setup/validate?token=${encodeURIComponent(token)}`,
    ACTIVATE: `${V1}/account-setup/activate`,
    RESEND_SETUP_EMAIL: `${V1}/account-setup/resend`,
  },

  PROFILE: {
    ME: `${V1}/auth/admin/me`,
    UPDATE_ME: `${V1}/auth/admin/me`,
    AVATAR: `${V1}/auth/admin/me/avatar`,
    CHANGE_PASSWORD: (id: string) => `${V1}/Admins/${id}/change-password`,
    SESSIONS: `${V1}/auth/admin/sessions`,
    REVOKE_SESSION: (tokenId: string) => `${V1}/auth/admin/sessions/${tokenId}`,
    REVOKE_ALL_SESSIONS: `${V1}/auth/admin/sessions/revoke-all`,
    BACKUP_CODES_REGENERATE: `${V1}/auth/admin/2fa/backup-codes/regenerate`,
    SECURITY_LOG: `${V1}/auth/admin/security-log`,
    EXTERNAL_LOGINS: `${V1}/auth/admin/external-logins`,
    LINK_EXTERNAL_LOGIN: `${V1}/auth/admin/external-logins/link`,
    UNLINK_EXTERNAL_LOGIN: (id: string) => `${V1}/auth/admin/external-logins/${id}`,
  },

  IDENTITY_PROVIDERS: {
    LIST: `${V1}/identity-providers`,
    BY_ID: (id: string) => `${V1}/identity-providers/${id}`,
    CREATE: `${V1}/identity-providers`,
    UPDATE: (id: string) => `${V1}/identity-providers/${id}`,
    DELETE: (id: string) => `${V1}/identity-providers/${id}`,
    TEST: (id: string) => `${V1}/identity-providers/${id}/test-connection`,
  },

  OAUTH_APPS: {
    LIST: `${V1}/oauth-applications`,
    BY_ID: (id: string) => `${V1}/oauth-applications/${id}`,
    CREATE: `${V1}/oauth-applications`,
    UPDATE: (id: string) => `${V1}/oauth-applications/${id}`,
    DELETE: (id: string) => `${V1}/oauth-applications/${id}`,
    REGENERATE_SECRET: (id: string) => `${V1}/oauth-applications/${id}/regenerate-secret`,
  },
};
