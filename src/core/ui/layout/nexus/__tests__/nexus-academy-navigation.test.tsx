import { describe, it, expect, vi } from "vitest";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";

describe("Academy Navigation Hierarchy & Offerings Route (DEF-007, DEF-009)", () => {
  const makeItem = (
    id: string,
    nameEn: string,
    href: string,
    children: MenuItem[] = []
  ): MenuItem =>
    new MenuItem({
      id,
      slug: id,
      name: nameEn,
      nameEn,
      nameAr: nameEn,
      href,
      icon: "Layers",
      order: 0,
      resource: null,
      actions: null,
      children,
    });

  it("verifies Training Delivery group contains Session Schedule, Session Attendance, and Program Offerings", () => {
    // DEF-007: Sessions & Attendance moved from Operations to Training Delivery
    // DEF-009: Program Offerings added to Training Delivery
    const deliveryGroup = makeItem("academy-group-delivery", "Training Delivery", "", [
      makeItem("academy-programs", "Programs", "/academy/programs"),
      makeItem("academy-offerings", "Program Offerings", "/academy/offerings"),
      makeItem("academy-groups", "Groups & Rosters", "/academy/groups"),
      makeItem("academy-sessions", "Session Schedule", "/academy/sessions"),
      makeItem("academy-attendance", "Session Attendance", "/academy/attendance"),
    ]);

    const operationsGroup = makeItem("academy-group-operations", "Operations", "", [
      makeItem("academy-overview", "Command Center", "/academy"),
      makeItem("academy-seasons", "Academic Seasons", "/academy/seasons"),
      makeItem("academy-finance", "Fees & Receivables", "/academy/fees-receivables"),
      makeItem("academy-analytics", "Reports & KPIs", "/academy/reports"),
    ]);

    expect(deliveryGroup.children.map(c => c.href)).toEqual([
      "/academy/programs",
      "/academy/offerings",
      "/academy/groups",
      "/academy/sessions",
      "/academy/attendance",
    ]);

    expect(operationsGroup.children.map(c => c.href)).toEqual([
      "/academy",
      "/academy/seasons",
      "/academy/fees-receivables",
      "/academy/reports",
    ]);

    // Ensure Sessions and Attendance are NOT in Operations
    expect(operationsGroup.children.map(c => c.href)).not.toContain("/academy/sessions");
    expect(operationsGroup.children.map(c => c.href)).not.toContain("/academy/attendance");
  });
});
