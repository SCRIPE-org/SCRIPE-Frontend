import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Sovereign Account World v3.0 API Endpoints
 */
export const PROFILE_ENDPOINTS = {
  ME: `${V1}/account/dossier`,
  UPDATE_ME: `${V1}/account/dossier`,
  AVATAR: `${V1}/account/dossier/avatar`,
  CHANGE_PASSWORD: (id: string) => `${V1}/Admins/${id}/change-password`,
  SESSIONS: `${V1}/auth/admin/sessions`,
  REVOKE_SESSION: (tokenId: string) => `${V1}/auth/admin/sessions/${tokenId}`,
  REVOKE_ALL_SESSIONS: `${V1}/auth/admin/sessions/revoke-all`,
  BACKUP_CODES_REGENERATE: `${V1}/auth/admin/2fa/backup-codes/regenerate`,
  SECURITY_LOG: `${V1}/auth/admin/security-log`,
  EXTERNAL_LOGINS: `${V1}/auth/admin/external-logins`,
  LINK_EXTERNAL_LOGIN: `${V1}/auth/admin/external-logins/link`,
  UNLINK_EXTERNAL_LOGIN: (id: string) => `${V1}/auth/admin/external-logins/${id}`,
  TWO_FA: {
    ENABLE: `${V1}/auth/admin/2fa/enable`,
    CONFIRM: `${V1}/auth/admin/2fa/confirm`,
    DISABLE: `${V1}/auth/admin/2fa/disable`,
  },
  PASSKEYS: {
    LIST: `${V1}/auth/passkeys`,
    REGISTER_BEGIN: `${V1}/auth/passkeys/registration/begin`,
    REGISTER_COMPLETE: `${V1}/auth/passkeys/registration/complete`,
    AUTH_BEGIN: `${V1}/auth/passkeys/authentication/begin`,
    DELETE: (id: string) => `${V1}/auth/passkeys/${id}`,
    RENAME: (id: string) => `${V1}/auth/passkeys/${id}/name`,
  },
  SUDO_VERIFY: `${V1}/auth/me/sudo-verify`,
  ACCOUNT: {
    CONTEXT: `${V1}/account/context`,
    DOSSIER: `${V1}/account/dossier`,
    SEND_EMAIL_VERIFICATION: `${V1}/account/dossier/send-verification`,
    SECURITY: `${V1}/account/security`,
    SESSIONS: `${V1}/account/sessions`,
    REVOKE_SESSION: (sessionId: string) => `${V1}/account/sessions/${sessionId}`,
    REVOKE_ALL_SESSIONS: `${V1}/account/sessions/revoke-all`,
    PING_SESSION: (sessionId: string) => `${V1}/account/sessions/${sessionId}/ping`,
    GOVERNANCE: `${V1}/account/governance`,
    DELEGATIONS: `${V1}/account/governance`,
    REVOKE_DELEGATION: (id: string) => `${V1}/account/governance/${id}`,
    ACTIVITY: `${V1}/account/activity`,
    PREFERENCES: `${V1}/account/preferences`,
    NOTIFICATIONS: `${V1}/account/notifications`,
    SEND_TEST_NOTIFICATION: `${V1}/account/notifications/test`,
    PLAN: `${V1}/account/plan`,
    PLAN_REQUEST: `${V1}/account/plan`,
    INTEGRATIONS: `${V1}/account/integrations`,
    INTEGRATION_BY_ID: (kind: string, id: string) => `${V1}/account/integrations/${kind}/${id}`,
  },
} as const;

