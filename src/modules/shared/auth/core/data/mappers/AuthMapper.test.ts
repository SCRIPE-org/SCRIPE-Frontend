import { describe, it, expect } from "vitest";
import { AuthMapper } from "./AuthMapper";
import { User } from "../../domain/entities/User";
import type { UserProfileJson } from "../models/AuthModel";

describe("AuthMapper", () => {
  const samplePrincipalJson: UserProfileJson = {
    id: "admin-guid-001",
    username: "ahly.admin",
    firstName: "Amr",
    lastName: "Farouk",
    phoneNumber: "+201000000000",
    email: "admin@ahly.eg",
    profileImageUrl: "https://cdn.scripe.org/avatar.png",
    isActive: true,
    lastLoginAt: "2026-11-12T12:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    modifiedAt: "2026-11-12T12:00:00Z",
    notes: null,
    roles: [
      {
        roleId: "role-super-admin",
        roleNameEn: "Super Administrator",
        roleNameAr: "مدير النظام العام",
        roleCode: "SuperAdmin",
        tenantId: "tenant-ahly",
        tenantName: "Al Ahly SC",
        inheritToChildren: true,
        expiresAt: "2027-01-01T00:00:00Z",
      },
    ],
    permissions: [
      "crm.leads.view",
      "crm.leads.create",
      "crm.opportunities.manage",
      "identity.users.view",
    ],
    tenantId: "tenant-ahly",
    tenantName: "Al Ahly SC",
    isSuperAdmin: true,
    isProtected: true,
    isAccountActivated: true,
    mustChangePassword: false,
    restrictedFields: {
      "crm.opportunity": ["commissionRate", "marginSecret"],
    },
  };

  it("maps /auth/admin/principal profile JSON into User entity with full roles and permissions preservation", () => {
    const user = AuthMapper.userFromJson(samplePrincipalJson);

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe("admin-guid-001");
    expect(user.username).toBe("ahly.admin");
    expect(user.firstName).toBe("Amr");
    expect(user.lastName).toBe("Farouk");
    expect(user.fullName).toBe("Amr Farouk");
    expect(user.email).toBe("admin@ahly.eg");
    expect(user.tenantId).toBe("tenant-ahly");
    expect(user.isSuperAdmin).toBe(true);
    expect(user.isProtected).toBe(true);

    // Roles mapping
    expect(user.roles).toBeDefined();
    expect(user.roles?.length).toBe(1);
    expect(user.roles?.[0].roleId).toBe("role-super-admin");
    expect(user.roles?.[0].roleName).toBe("Super Administrator");
    expect(user.roles?.[0].roleCode).toBe("SuperAdmin");
    expect(user.roles?.[0].tenantId).toBe("tenant-ahly");
    expect(user.roles?.[0].expiresAt).toBe("2027-01-01T00:00:00Z");

    // Permissions preservation
    expect(user.permissions).toEqual([
      "crm.leads.view",
      "crm.leads.create",
      "crm.opportunities.manage",
      "identity.users.view",
    ]);

    // Restricted fields
    expect(user.restrictedFields).toEqual({
      "crm.opportunity": ["commissionRate", "marginSecret"],
    });
  });

  it("defensively parses double-serialized stringified JSON from API responses", () => {
    const stringified = JSON.stringify(samplePrincipalJson);
    const user = AuthMapper.userFromJson(stringified);

    expect(user.id).toBe("admin-guid-001");
    expect(user.roles?.[0].roleCode).toBe("SuperAdmin");
    expect(user.permissions).toContain("crm.leads.view");
  });

  it("userFromUnknown correctly resolves User instances, strings, objects, and nulls", () => {
    const userInstance = AuthMapper.userFromJson(samplePrincipalJson);
    expect(AuthMapper.userFromUnknown(userInstance)).toBe(userInstance);

    const fromObj = AuthMapper.userFromUnknown(samplePrincipalJson);
    expect(fromObj?.id).toBe("admin-guid-001");

    const fromStr = AuthMapper.userFromUnknown(JSON.stringify(samplePrincipalJson));
    expect(fromStr?.id).toBe("admin-guid-001");

    expect(AuthMapper.userFromUnknown(null)).toBeNull();
    expect(AuthMapper.userFromUnknown(undefined)).toBeNull();
    expect(AuthMapper.userFromUnknown(12345)).toBeNull();
  });
});
