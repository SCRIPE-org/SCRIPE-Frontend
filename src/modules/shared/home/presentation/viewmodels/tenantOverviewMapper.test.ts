import { describe, it, expect } from "vitest";
import { buildTenantOverviewLiveData } from "./tenantOverviewMapper";
import { TENANT_MOCK_DATA } from "../components/tenant-command-center/tenantMockData";

describe("tenantOverviewMapper & Command Center Entry Points", () => {
  const dummyT = (key: string, params?: Record<string, any>) => {
    if (params) return `${key}:${JSON.stringify(params)}`;
    return key;
  };

  it("1. Step 2 links to canonical location route /venue/sites and never to dead /branches", () => {
    const data = buildTenantOverviewLiveData({
      t: dummyT,
      details: null,
      stats: null,
      summary: null,
    });

    const step2 = data.steps.find((s) => s.id === 2);
    expect(step2).toBeDefined();
    expect(step2?.href).toBe("/venue/sites");
    expect(step2?.href).not.toBe("/branches");
  });

  it("2. Does not derive branch count from subtenants", () => {
    const dataWithSubtenants = buildTenantOverviewLiveData({
      t: dummyT,
      details: null,
      stats: {
        subTenantsCount: 12,
        adminsCount: 2,
        usersCount: 50,
        rolesCount: 5,
        editionName: "Enterprise",
      } as any,
      summary: null,
    });

    // branchesAndSites must not use subtenants count as branch count
    expect(dataWithSubtenants.kpis.branchesAndSites.current).not.toBe(12);
    expect(dataWithSubtenants.kpis.branchesAndSites.current).toBe(0);

    // metaPills must not contain false subtenants-as-branches pill
    const branchPill = dataWithSubtenants.metaPills.find((p) => p.icon === "🏢");
    expect(branchPill).toBeUndefined();
  });

  it("3. Alerts do not produce false warning linking to dead /branches", () => {
    const data = buildTenantOverviewLiveData({
      t: dummyT,
      details: null,
      stats: { subTenantsCount: 0 } as any,
      summary: null,
    });

    const deadBranchAlert = data.alerts.find((a) => a.href === "/branches");
    expect(deadBranchAlert).toBeUndefined();
  });

  it("4. TENANT_MOCK_DATA product venue targets canonical /venue, not /venues", () => {
    const venueProduct = TENANT_MOCK_DATA.products.find((p) => p.id === "venue");
    expect(venueProduct).toBeDefined();
    expect(venueProduct?.href).toBe("/venue");
    expect(venueProduct?.href).not.toBe("/venues");

    // Truthful placeholder stats (no fabricated metrics presented as authoritative)
    for (const stat of venueProduct?.stats ?? []) {
      expect(stat.value).toBe("—");
    }
  });

  it("5. TENANT_MOCK_DATA quick action qa-2 targets canonical /venue/sites, not /branches", () => {
    const quickAction2 = TENANT_MOCK_DATA.quickActions.find((a) => a.id === "qa-2");
    expect(quickAction2).toBeDefined();
    expect(quickAction2?.href).toBe("/venue/sites");
    expect(quickAction2?.href).not.toBe("/branches");
  });
});
