/**
 * Hrms Module Permissions
 *
 * Covers: StaffMember, EmploymentRecord, StaffAssignment, StaffCompetency,
 * Qualification, Certification, StaffAvailability.
 *
 * Keys MUST match the backend HrmsPermissionProvider resource keys
 * ({resource}.{action}, kebab-case plural) exactly for permission parity.
 * The backend emits only these 7 resources x CRUD — there is no module-level
 * "hrms.view", so the module landing route reuses staff-members.view.
 */
export const HRMS_PERMISSIONS = {
  // ── Staff Members ───────────────────────────────────────
  STAFF_MEMBER_VIEW: "staff-members.view",
  STAFF_MEMBER_CREATE: "staff-members.create",
  STAFF_MEMBER_UPDATE: "staff-members.update",
  STAFF_MEMBER_DELETE: "staff-members.delete",

  // ── Employment Records ──────────────────────────────────
  EMPLOYMENT_RECORD_VIEW: "employment-records.view",
  EMPLOYMENT_RECORD_CREATE: "employment-records.create",
  EMPLOYMENT_RECORD_UPDATE: "employment-records.update",
  EMPLOYMENT_RECORD_DELETE: "employment-records.delete",

  // ── Staff Assignments ───────────────────────────────────
  STAFF_ASSIGNMENT_VIEW: "staff-assignments.view",
  STAFF_ASSIGNMENT_CREATE: "staff-assignments.create",
  STAFF_ASSIGNMENT_UPDATE: "staff-assignments.update",
  STAFF_ASSIGNMENT_DELETE: "staff-assignments.delete",

  // ── Staff Competencies ──────────────────────────────────
  STAFF_COMPETENCY_VIEW: "staff-competencies.view",
  STAFF_COMPETENCY_CREATE: "staff-competencies.create",
  STAFF_COMPETENCY_UPDATE: "staff-competencies.update",
  STAFF_COMPETENCY_DELETE: "staff-competencies.delete",

  // ── Qualifications ──────────────────────────────────────
  QUALIFICATION_VIEW: "qualifications.view",
  QUALIFICATION_CREATE: "qualifications.create",
  QUALIFICATION_UPDATE: "qualifications.update",
  QUALIFICATION_DELETE: "qualifications.delete",

  // ── Certifications ──────────────────────────────────────
  CERTIFICATION_VIEW: "certifications.view",
  CERTIFICATION_CREATE: "certifications.create",
  CERTIFICATION_UPDATE: "certifications.update",
  CERTIFICATION_DELETE: "certifications.delete",

  // ── Staff Availabilities ────────────────────────────────
  STAFF_AVAILABILITY_VIEW: "staff-availabilities.view",
  STAFF_AVAILABILITY_CREATE: "staff-availabilities.create",
  STAFF_AVAILABILITY_UPDATE: "staff-availabilities.update",
  STAFF_AVAILABILITY_DELETE: "staff-availabilities.delete",
} as const;
