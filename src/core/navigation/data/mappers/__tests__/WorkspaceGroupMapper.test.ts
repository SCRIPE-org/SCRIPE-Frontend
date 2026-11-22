import { describe, it, expect } from "vitest";
import { WorkspaceGroupMapper } from "../WorkspaceGroupMapper";
import { WorkspaceGroup } from "../../../domain/entities/WorkspaceGroup";

describe("WorkspaceGroupMapper — effective home metadata", () => {
  it("maps additive effectiveHome metadata from DTO and preserves it across WorkspaceGroup round-trip", () => {
    const data = WorkspaceGroupMapper.fromDto({
      workspaceId: "ws-crm",
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "إدارة العملاء",
      workspaceIcon: "Briefcase",
      workspaceSortOrder: 2,
      workspaceType: "Module",
      menuItems: [],
      isLocked: false,
      homeRoute: "/crm",
      platformHomeRoute: null,
      effectiveHomeRoute: "/crm/leads",
      effectiveHomeSource: "RoleEnforced",
      effectiveHomeMenuSlug: "crm-leads",
      effectiveHomeLabelEn: "Leads",
      effectiveHomeLabelAr: "العملاء المحتملون",
      isEffectiveHomeEnforced: true,
      enforcingRoleName: "Sales Director",
      lockReason: "None",
    });

    expect(data.effectiveHomeSource).toBe("RoleEnforced");
    expect(data.effectiveHomeMenuSlug).toBe("crm-leads");
    expect(data.effectiveHomeLabelEn).toBe("Leads");
    expect(data.effectiveHomeLabelAr).toBe("العملاء المحتملون");
    expect(data.isEffectiveHomeEnforced).toBe(true);
    expect(data.enforcingRoleName).toBe("Sales Director");

    const entity = new WorkspaceGroup(data);
    expect(entity.getEffectiveHomeLabel("en")).toBe("Leads");
    expect(entity.getEffectiveHomeLabel("ar")).toBe("العملاء المحتملون");
    expect(entity.toData()).toMatchObject({
      effectiveHomeRoute: "/crm/leads",
      effectiveHomeSource: "RoleEnforced",
      effectiveHomeMenuSlug: "crm-leads",
      effectiveHomeLabelEn: "Leads",
      effectiveHomeLabelAr: "العملاء المحتملون",
      isEffectiveHomeEnforced: true,
      enforcingRoleName: "Sales Director",
    });
  });

  it("normalizes blank/absent additive fields safely with non-enforced defaults", () => {
    const data = WorkspaceGroupMapper.fromDto({
      workspaceId: "ws-hrms",
      workspaceKey: "hrms",
      workspaceNameEn: "HRMS",
      effectiveHomeRoute: "   ",
      effectiveHomeSource: "",
      effectiveHomeMenuSlug: "  ",
      effectiveHomeLabelEn: " ",
      effectiveHomeLabelAr: null,
      enforcingRoleName: "",
    });

    const entity = new WorkspaceGroup(data);
    expect(entity.effectiveHomeRoute).toBeNull();
    expect(entity.effectiveHomeSource).toBeNull();
    expect(entity.effectiveHomeMenuSlug).toBeNull();
    expect(entity.effectiveHomeLabelEn).toBeNull();
    expect(entity.effectiveHomeLabelAr).toBeNull();
    expect(entity.isEffectiveHomeEnforced).toBe(false);
    expect(entity.enforcingRoleName).toBeNull();
    expect(entity.getEffectiveHomeLabel("en")).toBeNull();
  });
});
