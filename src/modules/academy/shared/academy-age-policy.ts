/**
 * Authoritative Academy Age Policy (mirrors AcademyAgePolicy.cs).
 *
 * Rules:
 * 1. ExactAge: exact calendar years elapsed between birth date and asOfDate (default: today).
 *    Strictly used for UI display and safeguarding (minor < 18 threshold). Never used for competition eligibility.
 * 2. CompetitionAge: birth-year standard (seasonReferenceYear - dob.Year).
 *    Strictly used for training group age bracket eligibility.
 * 3. Over-age athletes (CompetitionAge > maxAge): ALWAYS hard-blocked. No override permitted.
 * 4. Under-age athletes (CompetitionAge < minAge): Eligible ONLY if playing-up override permission is held AND a non-empty justification is provided.
 */

export function exactAge(dateOfBirth: string | Date | null | undefined, asOfDate: Date = new Date()): number | null {
  if (!dateOfBirth) return null;
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  if (isNaN(dob.getTime())) return null;
  let age = asOfDate.getUTCFullYear() - dob.getUTCFullYear();
  const m = asOfDate.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && asOfDate.getUTCDate() < dob.getUTCDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function formatExactAge(
  dateOfBirth: string | Date | null | undefined,
  asOfDate: Date = new Date(),
  lang: "en" | "ar" = "en"
): string {
  const age = exactAge(dateOfBirth, asOfDate);
  if (age === null) return "—";
  return lang === "ar" ? `${age} سنة` : `${age} years`;
}

export function competitionAge(dateOfBirth: string | Date | null | undefined, seasonReferenceYear: number): number | null {
  if (!dateOfBirth) return null;
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  if (isNaN(dob.getTime())) return null;
  return seasonReferenceYear - dob.getUTCFullYear();
}

export function getSeasonReferenceYear(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  return endYear > startYear ? endYear : startYear;
}

export interface AgeEligibilityCheck {
  isEligible: boolean;
  isOverAge: boolean;
  isUnderAge: boolean;
  requiresOverride: boolean;
  reasonEn: string | null;
  reasonAr: string | null;
}

export function checkGroupAgeEligibility(
  dateOfBirth: string | Date | null | undefined,
  minAge: number | null | undefined,
  maxAge: number | null | undefined,
  seasonReferenceYear: number | null | undefined
): AgeEligibilityCheck {
  if (!dateOfBirth) {
    return {
      isEligible: true,
      isOverAge: false,
      isUnderAge: false,
      requiresOverride: false,
      reasonEn: null,
      reasonAr: null,
    };
  }

  const refYear = seasonReferenceYear ?? new Date().getUTCFullYear();
  const compAge = competitionAge(dateOfBirth, refYear);

  if (compAge === null) {
    return {
      isEligible: true,
      isOverAge: false,
      isUnderAge: false,
      requiresOverride: false,
      reasonEn: null,
      reasonAr: null,
    };
  }

  if (maxAge !== null && maxAge !== undefined && maxAge > 0 && compAge > maxAge) {
    return {
      isEligible: false,
      isOverAge: true,
      isUnderAge: false,
      requiresOverride: false,
      reasonEn: `Ineligible: Maximum competition age is ${maxAge} (Athlete competition age: ${compAge}) - Over-age enrollment prohibited`,
      reasonAr: `غير مؤهل: الحد الأقصى لعمر المنافسة هو ${maxAge} (عمر المنافسة للاعب: ${compAge}) - يمنع تسجيل اللاعبين الأكبر سنًا`,
    };
  }

  if (minAge !== null && minAge !== undefined && minAge > 0 && compAge < minAge) {
    return {
      isEligible: false,
      isOverAge: false,
      isUnderAge: true,
      requiresOverride: true,
      reasonEn: `Ineligible: Minimum competition age is ${minAge} (Athlete competition age: ${compAge}) - Playing-up override required`,
      reasonAr: `غير مؤهل: الحد الأدنى لعمر المنافسة هو ${minAge} (عمر المنافسة للاعب: ${compAge}) - يتطلب استثناء تصعيد الفئة`,
    };
  }

  return {
    isEligible: true,
    isOverAge: false,
    isUnderAge: false,
    requiresOverride: false,
    reasonEn: null,
    reasonAr: null,
  };
}
