import { V1 } from "./_shared";

export const HRMS_ENDPOINTS = {
  STAFF_MEMBERS: {
    LIST: `${V1}/StaffMembers`,
    BY_ID: (id: string) => `${V1}/StaffMembers/${id}`,
    CREATE: `${V1}/StaffMembers`,
    UPDATE: (id: string) => `${V1}/StaffMembers/${id}`,
    DELETE: (id: string) => `${V1}/StaffMembers/${id}`,
  },
  EMPLOYMENT_RECORDS: {
    LIST: `${V1}/EmploymentRecords`,
    BY_ID: (id: string) => `${V1}/EmploymentRecords/${id}`,
    CREATE: `${V1}/EmploymentRecords`,
    UPDATE: (id: string) => `${V1}/EmploymentRecords/${id}`,
    DELETE: (id: string) => `${V1}/EmploymentRecords/${id}`,
  },
  STAFF_ASSIGNMENTS: {
    LIST: `${V1}/StaffAssignments`,
    BY_ID: (id: string) => `${V1}/StaffAssignments/${id}`,
    CREATE: `${V1}/StaffAssignments`,
    UPDATE: (id: string) => `${V1}/StaffAssignments/${id}`,
    DELETE: (id: string) => `${V1}/StaffAssignments/${id}`,
  },
  STAFF_COMPETENCIES: {
    LIST: `${V1}/StaffCompetencies`,
    BY_ID: (id: string) => `${V1}/StaffCompetencies/${id}`,
    CREATE: `${V1}/StaffCompetencies`,
    UPDATE: (id: string) => `${V1}/StaffCompetencies/${id}`,
    DELETE: (id: string) => `${V1}/StaffCompetencies/${id}`,
  },
  QUALIFICATIONS: {
    LIST: `${V1}/Qualifications`,
    BY_ID: (id: string) => `${V1}/Qualifications/${id}`,
    CREATE: `${V1}/Qualifications`,
    UPDATE: (id: string) => `${V1}/Qualifications/${id}`,
    DELETE: (id: string) => `${V1}/Qualifications/${id}`,
  },
  CERTIFICATIONS: {
    LIST: `${V1}/Certifications`,
    BY_ID: (id: string) => `${V1}/Certifications/${id}`,
    CREATE: `${V1}/Certifications`,
    UPDATE: (id: string) => `${V1}/Certifications/${id}`,
    DELETE: (id: string) => `${V1}/Certifications/${id}`,
  },
  STAFF_AVAILABILITIES: {
    LIST: `${V1}/StaffAvailabilities`,
    BY_ID: (id: string) => `${V1}/StaffAvailabilities/${id}`,
    CREATE: `${V1}/StaffAvailabilities`,
    UPDATE: (id: string) => `${V1}/StaffAvailabilities/${id}`,
    DELETE: (id: string) => `${V1}/StaffAvailabilities/${id}`,
  },
};
