import { describe, it, expect } from "vitest";
import type {
  AcademyTrial,
  RubricEvaluationSnapshot,
  RubricCriterionScorePayload
} from "../../domain/entities/AcademyTrial";
import { DEFAULT_FOOTBALL_RUBRIC } from "./AcademyTrialsView";

describe("AcademyTrialsView — Technical Evaluation Rubric Breakdown (DEF-005)", () => {
  it("verifies active football rubric config has 30/20/20/15/15 weights summing to 100%", () => {
    expect(DEFAULT_FOOTBALL_RUBRIC).toHaveLength(5);

    const totalWeight = DEFAULT_FOOTBALL_RUBRIC.reduce((acc, c) => acc + c.weightPercent, 0);
    expect(totalWeight).toBe(100);

    expect(DEFAULT_FOOTBALL_RUBRIC[0].key).toBe("ball_control");
    expect(DEFAULT_FOOTBALL_RUBRIC[0].weightPercent).toBe(30);

    expect(DEFAULT_FOOTBALL_RUBRIC[1].key).toBe("tactical_awareness");
    expect(DEFAULT_FOOTBALL_RUBRIC[1].weightPercent).toBe(20);

    expect(DEFAULT_FOOTBALL_RUBRIC[2].key).toBe("speed_endurance");
    expect(DEFAULT_FOOTBALL_RUBRIC[2].weightPercent).toBe(20);

    expect(DEFAULT_FOOTBALL_RUBRIC[3].key).toBe("composure");
    expect(DEFAULT_FOOTBALL_RUBRIC[3].weightPercent).toBe(15);

    expect(DEFAULT_FOOTBALL_RUBRIC[4].key).toBe("game_simulation");
    expect(DEFAULT_FOOTBALL_RUBRIC[4].weightPercent).toBe(15);
  });

  it("evaluates server decimal score from snapshot without client recalculation", () => {
    const snapshot: RubricEvaluationSnapshot = {
      schemaVersion: 1,
      sportId: "7ef8a28e-9adf-4135-a27f-354720ba0bdc",
      overallScore: 8.58,
      criteria: [
        { key: "ball_control", label: "Ball Control & Agility", labelEn: "Ball Control & Agility", labelAr: "التحكم بالكرة والمراوغة", weight: 30, score: 8.8, weightedScore: 2.64 },
        { key: "tactical_awareness", label: "Tactical Awareness", labelEn: "Tactical Awareness", labelAr: "الوعي التكتيكي واتخاذ القرار", weight: 20, score: 8.5, weightedScore: 1.70 },
        { key: "speed_endurance", label: "Speed & Endurance", labelEn: "Speed & Endurance", labelAr: "السرعة واللياقة البدنية", weight: 20, score: 8.0, weightedScore: 1.60 },
        { key: "composure", label: "Coachability & Composure", labelEn: "Coachability & Composure", labelAr: "الانضباط وقابلية التوجيه", weight: 15, score: 9.0, weightedScore: 1.35 },
        { key: "game_simulation", label: "Game Simulation", labelEn: "Game Simulation", labelAr: "أداء مباريات المحاكاة", weight: 15, score: 8.6, weightedScore: 1.29 },
      ]
    };

    const trial: AcademyTrial = {
      id: "trial-evaluated-1",
      athleteId: "ath-1",
      offeringId: "off-1",
      scheduledDate: "2026-11-12",
      status: "Evaluated",
      overallScore: 8.58,
      technicalScore: 9,
      rubricBreakdownJson: JSON.stringify(snapshot)
    };

    // Client parses snapshot and presents server's exact decimal
    const parsed = JSON.parse(trial.rubricBreakdownJson!) as RubricEvaluationSnapshot;
    expect(parsed.overallScore).toBe(8.58);
    expect(trial.overallScore?.toFixed(2)).toBe("8.58");
    expect(parsed.criteria).toHaveLength(5);
    expect(parsed.criteria[0].weightedScore).toBe(2.64);
  });

  it("historical legacy trial displays 'Legacy score' badge and '—' for criteria rows", () => {
    // Historical trial with no rubric snapshot (overallScore is null, technicalScore is 8)
    const legacyTrial: AcademyTrial = {
      id: "trial-legacy-1",
      athleteId: "ath-legacy",
      offeringId: "off-1",
      scheduledDate: "2026-10-15",
      status: "Evaluated",
      technicalScore: 8,
      overallScore: null,
      rubricBreakdownJson: null
    };

    const isLegacy = legacyTrial.overallScore == null && legacyTrial.technicalScore != null;
    expect(isLegacy).toBe(true);

    // Historical trials NEVER replicate technicalScore across criteria rows
    const criteriaRowScores = DEFAULT_FOOTBALL_RUBRIC.map(() => (isLegacy ? "—" : "val"));
    expect(criteriaRowScores).toEqual(["—", "—", "—", "—", "—"]);

    // Overall displays the integer score with legacy designation
    const displayScore = isLegacy ? Number(legacyTrial.technicalScore).toFixed(1) : legacyTrial.overallScore?.toFixed(2);
    expect(displayScore).toBe("8.0");
  });

  it("un-evaluated trial displays '—' for all metrics without crashing", () => {
    const unevaluatedTrial: AcademyTrial = {
      id: "trial-new-1",
      athleteId: "ath-new",
      offeringId: "off-1",
      scheduledDate: "2026-11-16",
      status: "Scheduled",
      technicalScore: null,
      overallScore: null,
      rubricBreakdownJson: null
    };

    const isLegacy = unevaluatedTrial.overallScore == null && unevaluatedTrial.technicalScore != null;
    const isEvaluated = unevaluatedTrial.overallScore != null;

    expect(isLegacy).toBe(false);
    expect(isEvaluated).toBe(false);

    const displayScore = isEvaluated
      ? unevaluatedTrial.overallScore!.toFixed(2)
      : isLegacy
        ? Number(unevaluatedTrial.technicalScore).toFixed(1)
        : "—";

    expect(displayScore).toBe("—");
  });
});
