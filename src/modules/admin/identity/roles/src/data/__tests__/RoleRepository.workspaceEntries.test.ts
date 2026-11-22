import { describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { RoleService } from "../services/RoleService";
import { RoleRepository } from "../repositories/RoleRepository";

describe("RoleRepository — per-workspace start-page policy CRUD", () => {
  it("fetches, upserts, and deletes /v1/roles/{id}/workspace-entries via RoleService -> IApiService", async () => {
    const mockGet = vi.fn().mockResolvedValue([
      {
        workspaceKey: "CRM",
        target: "menu:crm-leads",
        menuItemSlug: "crm-leads",
        menuItemNameEn: "Leads",
        menuItemNameAr: "العملاء",
        route: "/crm/leads/",
        isEnforced: true,
        isStale: false,
      },
    ]);
    const mockPut = vi.fn().mockResolvedValue({
      data: [
        {
          workspaceKey: "crm",
          target: "menu:crm-pipeline",
          menuItemSlug: "crm-pipeline",
          menuItemNameEn: "Pipeline",
          menuItemNameAr: "مسار المبيعات",
          route: "/crm/pipeline",
          isEnforced: false,
          isStale: false,
        },
      ],
    });
    const mockDelete = vi.fn().mockResolvedValue(undefined);

    const api = {
      get: mockGet,
      put: mockPut,
      delete: mockDelete,
    } as unknown as IApiService;

    const repo = new RoleRepository(new RoleService(api));

    const fetched = await repo.getRoleWorkspaceEntries("role-123");
    expect(mockGet).toHaveBeenCalledWith("/v1/roles/role-123/workspace-entries");
    expect(fetched).toHaveLength(1);
    expect(fetched[0].workspaceKey).toBe("crm");
    expect(fetched[0].route).toBe("/crm/leads");
    expect(fetched[0].isEnforced).toBe(true);
    expect(fetched[0].getLocalizedMenuName("ar")).toBe("العملاء");

    const updated = await repo.upsertRoleWorkspaceEntries(
      "role-123",
      [{ workspaceKey: "CRM", target: "MENU:crm-pipeline", isEnforced: false }],
      "rv-1"
    );
    expect(mockPut).toHaveBeenCalledWith("/v1/roles/role-123/workspace-entries", {
      policies: [{ workspaceKey: "crm", target: "menu:crm-pipeline", isEnforced: false }],
      rowVersion: "rv-1",
    });
    expect(updated[0].menuItemSlug).toBe("crm-pipeline");

    await repo.deleteRoleWorkspaceEntry("role-123", "CRM");
    expect(mockDelete).toHaveBeenCalledWith("/v1/roles/role-123/workspace-entries/crm");
  });
});
