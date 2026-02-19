/**
 * Mock data factories for tests.
 * Provides consistent test data shapes matching backend API responses.
 */

export function createMockAdmin(overrides: Partial<MockAdmin> = {}): MockAdmin {
      return {
            id: "encrypted-id-1",
            username: "testadmin",
            email: "admin@test.com",
            firstName: "Test",
            lastName: "Admin",
            phoneNumber: "+201234567890",
            isActive: true,
            isSuperAdmin: false,
            isProtected: false,
            isTwoFactorEnabled: false,
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            tenantId: "encrypted-tenant-1",
            roles: [{ id: "role-1", nameEn: "Admin", nameAr: "مدير" }],
            ...overrides,
      };
}

export function createMockTokenResponse(overrides: Partial<MockTokenResponse> = {}): MockTokenResponse {
      return {
            accessToken: "mock-jwt-access-token",
            refreshToken: "mock-refresh-token",
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            requires2FA: false,
            ...overrides,
      };
}

export function createMockTenant(overrides: Partial<MockTenant> = {}): MockTenant {
      return {
            id: "encrypted-tenant-1",
            name: "Test Company",
            code: "TEST",
            description: "Test tenant for unit tests",
            isActive: true,
            hierarchyLevel: 0,
            createdAt: new Date().toISOString(),
            ...overrides,
      };
}

export function createMockRole(overrides: Partial<MockRole> = {}): MockRole {
      return {
            id: "encrypted-role-1",
            nameEn: "Admin",
            nameAr: "مدير",
            code: "ADMIN",
            isSystem: false,
            isDeletable: true,
            isPermissionLocked: false,
            createdAt: new Date().toISOString(),
            ...overrides,
      };
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface MockAdmin {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      isActive: boolean;
      isSuperAdmin: boolean;
      isProtected: boolean;
      isTwoFactorEnabled: boolean;
      lastLoginAt: string;
      createdAt: string;
      tenantId: string;
      roles: { id: string; nameEn: string; nameAr: string }[];
}

interface MockTokenResponse {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      requires2FA: boolean;
}

interface MockTenant {
      id: string;
      name: string;
      code: string;
      description: string;
      isActive: boolean;
      hierarchyLevel: number;
      createdAt: string;
}

interface MockRole {
      id: string;
      nameEn: string;
      nameAr: string;
      code: string;
      isSystem: boolean;
      isDeletable: boolean;
      isPermissionLocked: boolean;
      createdAt: string;
}
