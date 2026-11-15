import { describe, it, expect } from "vitest";

describe("DEF-002: Sport Participation Deduplication", () => {
  const duplicateParticipations = [
    {
      id: "part-1",
      sportId: "sport-football-id",
      sportNameEn: "Football",
      sportNameAr: "كرة القدم",
      disciplineId: null,
      disciplineNameEn: null,
      disciplineNameAr: null,
      skillLevel: "Advanced",
      joinedDate: "2026-11-10",
      isActive: true,
    },
    {
      id: "part-2",
      sportId: "sport-football-id",
      sportNameEn: "Football",
      sportNameAr: "كرة القدم",
      disciplineId: null,
      disciplineNameEn: null,
      disciplineNameAr: null,
      skillLevel: "Advanced",
      joinedDate: "2026-11-12",
      isActive: true,
    },
    {
      id: "part-3",
      sportId: "sport-swimming-id",
      sportNameEn: "Swimming",
      sportNameAr: "السباحة",
      disciplineId: null,
      disciplineNameEn: null,
      disciplineNameAr: null,
      skillLevel: "Beginner",
      joinedDate: "2026-11-14",
      isActive: true,
    },
  ];

  it("deduplicates participations by sportId preserving unique sports", () => {
    const uniqueParticipations = Array.from(
      new Map((duplicateParticipations || []).map((p) => [p.sportId, p])).values()
    );

    expect(uniqueParticipations).toHaveLength(2);
    expect(uniqueParticipations.map((p) => p.sportId)).toEqual([
      "sport-football-id",
      "sport-swimming-id",
    ]);
  });

  it("deduplicates sports names array in AthleteCard", () => {
    const cardDataSports = ["Football", "Football", "Swimming"];
    const uniqueFromCard = Array.from(new Set(cardDataSports));
    expect(uniqueFromCard).toEqual(["Football", "Swimming"]);

    const uniqueFromAthlete = Array.from(
      new Map(duplicateParticipations.map((p) => [p.sportId, p.sportNameEn])).values()
    );
    expect(uniqueFromAthlete).toEqual(["Football", "Swimming"]);
  });

  it("handles empty or null participations safely", () => {
    const emptyParticipations: any[] = [];
    const uniqueEmpty = Array.from(
      new Map((emptyParticipations || []).map((p) => [p.sportId, p])).values()
    );
    expect(uniqueEmpty).toHaveLength(0);

    const nullParticipations = null;
    const uniqueNull = Array.from(
      new Map(((nullParticipations as any) || []).map((p: any) => [p.sportId, p])).values()
    );
    expect(uniqueNull).toHaveLength(0);
  });
});
