import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
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
  // NOTE: a `LEGACY` block (`/v1/profile/*`) used to live here. No `ProfileController`
  // has ever existed in SCRIPE-Backend (verified: zero matches for "ProfileController"
  // under SCRIPE-Backend/src/Host/API/Controllers) — every one of those routes was a
  // 404. ProfileService.ts's 13 call sites all used LEGACY.*, making the entire Profile
  // Settings page (profile/page.tsx) 404 on every operation. Removed 2026-08-02 in favor
  // of the already-correct, already-implemented endpoints above (ME/UPDATE_ME/AVATAR/
  // CHANGE_PASSWORD/SESSIONS/REVOKE_SESSION/REVOKE_ALL_SESSIONS/
  // BACKUP_CODES_REGENERATE/SECURITY_LOG/EXTERNAL_LOGINS/LINK_EXTERNAL_LOGIN/
  // UNLINK_EXTERNAL_LOGIN) — see ProfileService.test.ts for the call-site contract.
} as const;
