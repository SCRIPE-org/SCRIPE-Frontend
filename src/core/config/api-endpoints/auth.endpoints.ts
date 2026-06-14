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
    ADMIN_VERIFY_RESET_OTP: `${V1}/auth/admin/verify-reset-otp`,
    ADMIN_RESET_PASSWORD: `${V1}/auth/admin/reset-password`,
    // ── Workspace Discovery — returns all tenants for an email ──
    DISCOVER_WORKSPACES: `${V1}/auth/admin/discover-workspaces`,
    TWO_FA: {
      ENABLE: `${V1}/auth/admin/2fa/enable`,
      CONFIRM: `${V1}/auth/admin/2fa/confirm`,
      VERIFY: `${V1}/auth/admin/2fa/verify`,
      DISABLE: `${V1}/auth/admin/2fa/disable`,
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
    },
    SAML: {
      LOGIN: `${V1}/auth/saml/login`,
    },
    // ── Self-service signup ────────────────────────────────────────────
    SIGNUP: {
      /** Detects visitor country → returns recommended currency + all rates (cached 24h). */
      PRICING_CONTEXT: `${V1}/auth/signup/pricing-context`,
      GET_CATEGORIES: `${V1}/auth/signup/categories`,
      GET_EDITIONS: `${V1}/auth/signup/editions`,
      SEND_OTP: `${V1}/auth/signup/send-otp`,
      VERIFY_OTP: `${V1}/auth/signup/verify-otp`,
      CHECK_SUBDOMAIN: `${V1}/auth/signup/check-subdomain`,
      CONTACT_SALES: `${V1}/auth/signup/contact-sales`,
      REGISTER: `${V1}/auth/signup/register`,
      STATUS: `${V1}/auth/signup/status`,
      COMPLETE_SESSION: `${V1}/auth/signup/complete-session`,
      ABANDON: `${V1}/auth/signup/abandon`,
      /** Validate an existing signupRef and return plan snapshot for UI restore. */
      RESUME: `${V1}/auth/signup/resume`,
      /** Change the selected plan while still awaiting payment — returns new checkoutUrl. */
      CHANGE_PLAN: `${V1}/auth/signup/change-plan`,
      /**
       * Server-side recommendation engine.
       * GET ?vertical=&teamSize=&priorities=&currency=&lang=
       * Returns { recommendedTier, recommendedEditionName, score, reason }.
       * Falls back to local computeRecommendedTier() if this call fails.
       */
      RECOMMENDATION: `${V1}/auth/signup/recommendation`,
      /** Onboarding Intelligence Engine — returns dynamic Q&A flow for a category. */
      ONBOARDING_FLOW: `${V1}/onboarding/flow`,
      /** Onboarding Intelligence Engine — scores answers and returns recommended edition. */
      ONBOARDING_RECOMMENDATION: `${V1}/onboarding/recommendation`,
      /** Onboarding Intelligence Engine — records a single answer against the session. */
      ONBOARDING_ANSWER: `${V1}/onboarding/answer`,
    },
    // ── Passkey / WebAuthn ────────────────────────────────────
    PASSKEY: {
      REGISTER_BEGIN: `${V1}/auth/passkeys/registration/begin`,
      REGISTER_VERIFY: `${V1}/auth/passkeys/registration/complete`,
      AUTH_BEGIN: `${V1}/auth/passkeys/authentication/begin`,
      AUTH_VERIFY: `${V1}/auth/passkeys/authentication/verify`,
      LIST: `${V1}/auth/passkeys`,
      DELETE: (id: string) => `${V1}/auth/passkeys/${id}`,
    },
    // ── Phone OTP login ──────────────────────────────────────
    PHONE_OTP: {
      REQUEST: `${V1}/auth/phone-otp/request`,
      VERIFY: `${V1}/auth/phone-otp/verify`,
    },
    // ── QR cross-device login ────────────────────────────────
    QR_LOGIN: {
      CREATE_SESSION: `${V1}/auth/qr-login/session`,
      SESSION_STATUS: (id: string) => `${V1}/auth/qr-login/session/${id}/status`,
      APPROVE: `${V1}/auth/qr-login/approve`,
      REJECT: `${V1}/auth/qr-login/reject`,
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
