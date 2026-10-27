import { describe, it, expect } from "vitest";
import { ACADEMY_PERMISSIONS } from "./permission-constants";

describe("ACADEMY_PERMISSIONS", () => {
  it("defines all canonical academy permissions matching backend catalog", () => {
    expect(ACADEMY_PERMISSIONS.ACADEMY_OVERVIEW_VIEW).toBe("academy-overview.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_SAFEGUARDING_VIEW).toBe("academy-safeguarding.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_VIEW).toBe("academy-programs.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_PROGRAMS_CREATE).toBe("academy-programs.create");
    expect(ACADEMY_PERMISSIONS.ACADEMY_OFFERINGS_VIEW).toBe("academy-offerings.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_VIEW).toBe("academy-trials.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_TRIALS_REVIEW).toBe("academy-trials.review");
    expect(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW).toBe("academy-enrollments.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_GROUPS_VIEW).toBe("academy-groups.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_SESSIONS_VIEW).toBe("academy-sessions.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_VIEW).toBe("academy-attendance.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_ATTENDANCE_RECORD).toBe("academy-attendance.record");
    expect(ACADEMY_PERMISSIONS.ACADEMY_LOCATIONS_VIEW).toBe("academy-locations.view");
    expect(ACADEMY_PERMISSIONS.ACADEMY_ASSESSMENTS_VIEW).toBe("academy-assessments.view");
  });

  it("contains no duplicate values", () => {
    const values = Object.values(ACADEMY_PERMISSIONS);
    const unique = new Set(values);
    expect(values.length).toBe(unique.size);
  });
});
