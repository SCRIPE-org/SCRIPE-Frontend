import { describe, expect, it } from "vitest";
import { evaluateCourtReadiness } from "./ResourceWorkspaceItem";

describe("evaluateCourtReadiness", () => {
  it("returns Active when all mandatory dependencies are satisfied", () => {
    const result = evaluateCourtReadiness({
      isPublished: true,
      profileId: "prof-1",
      slotDurationMinutes: 60,
      pricePerSlot: 800,
      hasCalendar: true,
    });

    expect(result.state).toBe("Active");
    expect(result.missingActions).toHaveLength(0);
  });

  it("returns Setup Required with pricing action when price is missing", () => {
    const result = evaluateCourtReadiness({
      isPublished: true,
      profileId: "prof-1",
      slotDurationMinutes: 60,
      pricePerSlot: null,
      hasCalendar: true,
    });

    expect(result.state).toBe("Setup Required");
    expect(result.missingActions).toContainEqual(
      expect.objectContaining({ id: "pricing", tab: "pricing" })
    );
  });

  it("returns Setup Required with publish action when court is unpublished", () => {
    const result = evaluateCourtReadiness({
      isPublished: false,
      profileId: "prof-1",
      slotDurationMinutes: 60,
      pricePerSlot: 800,
      hasCalendar: true,
    });

    expect(result.state).toBe("Setup Required");
    expect(result.missingActions).toContainEqual(
      expect.objectContaining({ id: "publish", tab: "general" })
    );
  });

  it("returns Setup Required with slot policy action when slotDurationMinutes is missing or zero", () => {
    const result = evaluateCourtReadiness({
      isPublished: true,
      profileId: "prof-1",
      slotDurationMinutes: 0,
      pricePerSlot: 800,
      hasCalendar: true,
    });

    expect(result.state).toBe("Setup Required");
    expect(result.missingActions).toContainEqual(
      expect.objectContaining({ id: "slotPolicy", tab: "bookingRules" })
    );
  });

  it("returns Setup Required with calendar action when hasCalendar is explicitly false", () => {
    const result = evaluateCourtReadiness({
      isPublished: true,
      profileId: "prof-1",
      slotDurationMinutes: 60,
      pricePerSlot: 800,
      hasCalendar: false,
    });

    expect(result.state).toBe("Setup Required");
    expect(result.missingActions).toContainEqual(
      expect.objectContaining({ id: "calendar", tab: "workingHours" })
    );
  });
});
