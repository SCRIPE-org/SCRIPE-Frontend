import { V1 } from "@/core/config/api-endpoints/_shared";

export const PROFILE_ENDPOINTS = {
  ME: `${V1}/Admins/me`,
  UPDATE_ME: `${V1}/Admins/me`,
  AVATAR: `${V1}/Admins/me/avatar`,
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
  LEGACY: {
    ME: `${V1}/profile`,
    AVATAR: `${V1}/profile/avatar`,
    CHANGE_PASSWORD: `${V1}/profile/change-password`,
    SESSIONS: `${V1}/profile/sessions`,
    REVOKE_SESSION: (tokenId: string) => `${V1}/profile/sessions/${tokenId}`,
    BACKUP_CODES: `${V1}/profile/2fa/backup-codes`,
    SECURITY_LOG: `${V1}/profile/security-log`,
    EXTERNAL_LOGINS: `${V1}/profile/external-logins`,
    UNLINK_EXTERNAL_LOGIN: (id: string) => `${V1}/profile/external-logins/${id}`,
  },
} as const;
