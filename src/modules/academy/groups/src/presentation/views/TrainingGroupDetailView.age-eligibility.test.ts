import { describe, it, expect } from "vitest";
import {
  checkGroupAgeEligibility,
  competitionAge,
  exactAge,
} from "@modules/academy/shared";

describe("TrainingGroupDetailView — Age Eligibility & Safeguarding (DEF-003)", () => {
  const seasonReferenceYear = 2026;

  describe("Option A: Birth-Year Standard Anchored to Season Reference Year", () => {
    it("computes CompetitionAge strictly as seasonReferenceYear - dob.Year", () => {
      // Born Nov 10, 2014 in season reference year 2026 -> 2026 - 2014 = 12
      expect(competitionAge("2014-11-10", seasonReferenceYear)).toBe(12);
      // Born Jan 1, 2014 in season reference year 2026 -> 2026 - 2014 = 12
      expect(competitionAge("2014-01-01", seasonReferenceYear)).toBe(12);
      // Born Dec 31, 2014 in season reference year 2026 -> 2026 - 2014 = 12
      expect(competitionAge("2014-12-31", seasonReferenceYear)).toBe(12);
    });

    it("keeps ExactAge separate for display and safeguarding minor threshold (< 18)", () => {
      const bornNov20_2008 = "2008-11-20";
      const asOfDate = new Date("2026-11-15T00:00:00Z");

      // Exact calendar age on Nov 15, 2026 is 17 (turns 18 on Nov 20)
      const exact = exactAge(bornNov20_2008, asOfDate);
      expect(exact).toBe(17);
      expect(exact !== null && exact < 18).toBe(true); // Minor safeguarding gate

      // Competition age for 2026 is 2026 - 2008 = 18, which MUST NEVER be used for the 18 threshold
      const comp = competitionAge(bornNov20_2008, seasonReferenceYear);
      expect(comp).toBe(18);
    });
  });

  describe("Group Age Eligibility Checks", () => {
    const juniorGroup = {
      minAge: 10,
      maxAge: 12,
      seasonReferenceYear: 2026,
    };

    it("marks over-age athletes as hard-blocked with bilingual tooltip reasons", () => {
      // Born 2012 -> competition age 14 (> maxAge 12)
      const check = checkGroupAgeEligibility(
        "2012-05-01",
        juniorGroup.minAge,
        juniorGroup.maxAge,
        juniorGroup.seasonReferenceYear
      );

      expect(check.isEligible).toBe(false);
      expect(check.isOverAge).toBe(true);
      expect(check.requiresOverride).toBe(false); // Over-age override NEVER permitted
      expect(check.reasonEn).toContain("Maximum competition age is 12 (Athlete competition age: 14) - Over-age enrollment prohibited");
      expect(check.reasonAr).toContain("الحد الأقصى لعمر المنافسة هو 12 (عمر المنافسة للاعب: 14) - يمنع تسجيل اللاعبين الأكبر سنًا");
    });

    it("marks under-age athletes as requiring override with bilingual tooltip reasons", () => {
      // Born 2018 -> competition age 8 (< minAge 10)
      const check = checkGroupAgeEligibility(
        "2018-05-01",
        juniorGroup.minAge,
        juniorGroup.maxAge,
        juniorGroup.seasonReferenceYear
      );

      expect(check.isEligible).toBe(false);
      expect(check.isUnderAge).toBe(true);
      expect(check.requiresOverride).toBe(true); // Playing up allowed with permission
      expect(check.reasonEn).toContain("Minimum competition age is 10 (Athlete competition age: 8) - Playing-up override required");
      expect(check.reasonAr).toContain("الحد الأدنى لعمر المنافسة هو 10 (عمر المنافسة للاعب: 8) - يتطلب استثناء تصعيد الفئة");
    });

    it("marks age-bracket compliant athletes as eligible", () => {
      // Born 2015 -> competition age 11 (within 10-12)
      const check = checkGroupAgeEligibility(
        "2015-05-01",
        juniorGroup.minAge,
        juniorGroup.maxAge,
        juniorGroup.seasonReferenceYear
      );

      expect(check.isEligible).toBe(true);
      expect(check.isOverAge).toBe(false);
      expect(check.isUnderAge).toBe(false);
      expect(check.requiresOverride).toBe(false);
      expect(check.reasonEn).toBeNull();
      expect(check.reasonAr).toBeNull();
    });
  });

  describe("UI Dropdown Selection Filtering Logic", () => {
    it("disables over-age options unconditionally and under-age options when user lacks override permission", () => {
      const groupMin = 10;
      const groupMax = 12;
      const refYear = 2026;

      const athletes = [
        { id: "ath-normal", dob: "2015-01-01" }, // age 11
        { id: "ath-over", dob: "2012-01-01" },   // age 14
        { id: "ath-under", dob: "2018-01-01" },  // age 8
      ];

      // Case 1: User WITHOUT override permission
      const userWithoutOverride = athletes.map(a => {
        const check = checkGroupAgeEligibility(a.dob, groupMin, groupMax, refYear);
        return {
          id: a.id,
          disabled: check.isOverAge || (check.isUnderAge && !false),
        };
      });

      expect(userWithoutOverride.find(a => a.id === "ath-normal")?.disabled).toBe(false);
      expect(userWithoutOverride.find(a => a.id === "ath-over")?.disabled).toBe(true);
      expect(userWithoutOverride.find(a => a.id === "ath-under")?.disabled).toBe(true);

      // Case 2: User WITH override permission
      const userWithOverride = athletes.map(a => {
        const check = checkGroupAgeEligibility(a.dob, groupMin, groupMax, refYear);
        return {
          id: a.id,
          disabled: check.isOverAge || (check.isUnderAge && !true),
        };
      });

      expect(userWithOverride.find(a => a.id === "ath-normal")?.disabled).toBe(false);
      expect(userWithOverride.find(a => a.id === "ath-over")?.disabled).toBe(true); // Still disabled! Over-age NEVER allowed
      expect(userWithOverride.find(a => a.id === "ath-under")?.disabled).toBe(false); // Enabled for playing up!
    });
  });
});
