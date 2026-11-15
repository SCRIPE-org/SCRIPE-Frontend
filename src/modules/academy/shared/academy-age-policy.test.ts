import { describe, it, expect } from "vitest";
import {
  exactAge,
  competitionAge,
  checkGroupAgeEligibility,
} from "./academy-age-policy";

describe("DEF-003: AcademyAgePolicy Tests", () => {
  describe("exactAge", () => {
    it("calculates exact calendar age elapsed before and after birthday", () => {
      // Born 2010-06-15
      const dob = "2010-06-15";

      // On 2026-06-14 (day before 16th birthday), exact age is 15
      expect(exactAge(dob, new Date("2026-06-14T00:00:00Z"))).toBe(15);

      // On 2026-06-15 (16th birthday), exact age is 16
      expect(exactAge(dob, new Date("2026-06-15T00:00:00Z"))).toBe(16);
    });

    it("evaluates adult/minor 18 safeguarding strictly on exact age", () => {
      const born2008 = "2008-11-20";
      const asOfNov15_2026 = new Date("2026-11-15T00:00:00Z");
      // Exactly 17 on Nov 15, turns 18 on Nov 20
      const age = exactAge(born2008, asOfNov15_2026);
      expect(age).toBe(17);
      expect(age < 18).toBe(true); // IsMinor is true
    });
  });

  describe("competitionAge", () => {
    it("calculates birth-year competition age anchored to season reference year", () => {
      // Option A: seasonReferenceYear - dob.Year
      const dob = "2014-11-10";
      const seasonRefYear = 2026;
      expect(competitionAge(dob, seasonRefYear)).toBe(12);
    });
  });

  describe("checkGroupAgeEligibility", () => {
    const seasonRefYear = 2026;
    const minAge = 10;
    const maxAge = 12;

    it("passes when athlete competition age falls within [minAge, maxAge]", () => {
      // Born 2015 -> 2026 - 2015 = 11 (within 10-12)
      const res = checkGroupAgeEligibility("2015-05-10", minAge, maxAge, seasonRefYear);
      expect(res.isEligible).toBe(true);
      expect(res.isOverAge).toBe(false);
      expect(res.isUnderAge).toBe(false);
      expect(res.requiresOverride).toBe(false);
      expect(res.reasonEn).toBeNull();
      expect(res.reasonAr).toBeNull();
    });

    it("hard-blocks over-age athlete when competition age > maxAge", () => {
      // Born 2012 -> 2026 - 2012 = 14 (> 12)
      const res = checkGroupAgeEligibility("2012-01-15", minAge, maxAge, seasonRefYear);
      expect(res.isEligible).toBe(false);
      expect(res.isOverAge).toBe(true);
      expect(res.isUnderAge).toBe(false);
      expect(res.requiresOverride).toBe(false);
      expect(res.reasonEn).toContain("Over-age enrollment prohibited");
      expect(res.reasonAr).toContain("يمنع تسجيل اللاعبين الأكبر سنًا");
    });

    it("flags under-age athlete requiring playing-up override when competition age < minAge", () => {
      // Born 2018 -> 2026 - 2018 = 8 (< 10)
      const res = checkGroupAgeEligibility("2018-03-20", minAge, maxAge, seasonRefYear);
      expect(res.isEligible).toBe(false);
      expect(res.isOverAge).toBe(false);
      expect(res.isUnderAge).toBe(true);
      expect(res.requiresOverride).toBe(true);
      expect(res.reasonEn).toContain("Playing-up override required");
      expect(res.reasonAr).toContain("يتطلب استثناء تصعيد الفئة");
    });
  });
});
