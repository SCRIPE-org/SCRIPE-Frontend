/**
 * SCRIPE Academy Module Permissions
 *
 * Keys strictly match the backend IModulePermissionProvider resource keys
 * ({resource}.{action}) for complete server/client PBAC parity.
 */
export const ACADEMY_PERMISSIONS = {
  // ── Overview & Command Center ──
  ACADEMY_OVERVIEW_VIEW: "academy-overview.view",

  // ── Programs ──
  ACADEMY_PROGRAMS_VIEW: "academy-programs.view",
  ACADEMY_PROGRAMS_CREATE: "academy-programs.create",
  ACADEMY_PROGRAMS_UPDATE: "academy-programs.update",
  ACADEMY_PROGRAMS_DELETE: "academy-programs.delete",

  // ── Offerings ──
  ACADEMY_OFFERINGS_VIEW: "academy-offerings.view",
  ACADEMY_OFFERINGS_CREATE: "academy-offerings.create",
  ACADEMY_OFFERINGS_UPDATE: "academy-offerings.update",
  ACADEMY_OFFERINGS_DELETE: "academy-offerings.delete",

  // ── Trials ──
  ACADEMY_TRIALS_VIEW: "academy-trials.view",
  ACADEMY_TRIALS_CREATE: "academy-trials.create",
  ACADEMY_TRIALS_UPDATE: "academy-trials.update",
  ACADEMY_TRIALS_REVIEW: "academy-trials.review",
  ACADEMY_TRIALS_DELETE: "academy-trials.delete",

  // ── Enrollments ──
  ACADEMY_ENROLLMENTS_VIEW: "academy-enrollments.view",
  ACADEMY_ENROLLMENTS_CREATE: "academy-enrollments.create",
  ACADEMY_ENROLLMENTS_UPDATE: "academy-enrollments.update",
  ACADEMY_ENROLLMENTS_CANCEL: "academy-enrollments.cancel",
  ACADEMY_ENROLLMENTS_TRANSFER: "academy-enrollments.transfer",

  // ── Training Groups ──
  ACADEMY_GROUPS_VIEW: "academy-groups.view",
  ACADEMY_GROUPS_CREATE: "academy-groups.create",
  ACADEMY_GROUPS_UPDATE: "academy-groups.update",
  ACADEMY_GROUPS_DELETE: "academy-groups.delete",

  // ── Training Sessions ──
  ACADEMY_SESSIONS_VIEW: "academy-sessions.view",
  ACADEMY_SESSIONS_CREATE: "academy-sessions.create",
  ACADEMY_SESSIONS_UPDATE: "academy-sessions.update",
  ACADEMY_SESSIONS_DELETE: "academy-sessions.delete",

  // ── Attendance ──
  ACADEMY_ATTENDANCE_VIEW: "academy-attendance.view",
  ACADEMY_ATTENDANCE_RECORD: "academy-attendance.record",
  ACADEMY_ATTENDANCE_CORRECT: "academy-attendance.correct",

  // ── Training Locations ──
  ACADEMY_LOCATIONS_VIEW: "academy-locations.view",
  ACADEMY_LOCATIONS_CREATE: "academy-locations.create",
  ACADEMY_LOCATIONS_UPDATE: "academy-locations.update",
  ACADEMY_LOCATIONS_DELETE: "academy-locations.delete",

  // ── Assessments ──
  ACADEMY_ASSESSMENTS_VIEW: "academy-assessments.view",
  ACADEMY_ASSESSMENTS_RECORD: "academy-assessments.record",
  ACADEMY_ASSESSMENTS_UPDATE: "academy-assessments.update",
} as const;

export type AcademyPermissionKey = keyof typeof ACADEMY_PERMISSIONS;
export type AcademyPermissionCode = (typeof ACADEMY_PERMISSIONS)[AcademyPermissionKey];
