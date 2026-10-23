import { describe, it, expect } from "vitest";
import { Admin, type AdminData } from "./Admin";

describe("Admin Domain Entity - Guardian Protection & Modifiability", () => {
  const baseData: AdminData = {
    id: "admin-1",
    username: "opsadmin",
    isActive: true,
    createdAt: "2026-10-17T00:00:00Z",
    modifiedAt: "2026-10-17T00:00:00Z",
  };

  it("should have hasGuardianProtection = true when isProtected = true", () => {
    const admin = new Admin({
      ...baseData,
      username: "superadmin",
      isSuperAdmin: true,
      isProtected: true,
      canModify: false,
    });

    expect(admin.isProtected).toBe(true);
    expect(admin.hasGuardianProtection).toBe(true);
    expect(admin.canModify).toBe(false);
  });

  it("should have hasGuardianProtection = false for non-protected admin even if canModify is false", () => {
    const admin = new Admin({
      ...baseData,
      username: "auditor",
      isSuperAdmin: false,
      isProtected: false,
      canModify: false,
    });

    expect(admin.isProtected).toBe(false);
    expect(admin.hasGuardianProtection).toBe(false);
    expect(admin.canModify).toBe(false);
  });

  it("should allow regular platform operators to have isProtected = false and canModify = true", () => {
    const admin = new Admin({
      ...baseData,
      username: "platformsupport",
      isSuperAdmin: false,
      isProtected: false,
      canModify: true,
    });

    expect(admin.isProtected).toBe(false);
    expect(admin.hasGuardianProtection).toBe(false);
    expect(admin.canModify).toBe(true);
  });

  it("should properly identify protected tenant admin with shield protection", () => {
    const admin = new Admin({
      ...baseData,
      username: "ahly.admin",
      tenantId: "tenant-123",
      isSuperAdmin: false,
      isProtected: true,
      canModify: false,
    });

    expect(admin.isProtected).toBe(true);
    expect(admin.hasGuardianProtection).toBe(true);
    expect(admin.isSuperAdmin).toBe(false);
    expect(admin.tenantId).toBe("tenant-123");
  });
});
