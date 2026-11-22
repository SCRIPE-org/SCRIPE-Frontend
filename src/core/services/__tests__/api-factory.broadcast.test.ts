import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createdInstances: Array<{
  baseUrl: string;
  setTenantContext: ReturnType<typeof vi.fn>;
  calls: Array<string | null>;
}> = [];

vi.mock("../api.service", () => ({
  ApiService: class MockApiService {
    baseUrl: string;
    calls: Array<string | null> = [];
    setTenantContext = vi.fn((tenantId: string | null) => {
      this.calls.push(tenantId);
    });

    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
      createdInstances.push({
        baseUrl,
        setTenantContext: this.setTenantContext,
        calls: this.calls,
      });
    }
  },
}));

describe("api-factory broadcastTenantContext", () => {
  beforeEach(() => {
    createdInstances.length = 0;
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("broadcasts tenant context updates across base and microservice ApiService instances", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.test/api");
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "https://crm.scripe.test/api");
    vi.stubEnv("NEXT_PUBLIC_DATATRANSFER_API_URL", "https://dt.scripe.test/api");

    const { getBaseApiService, getModuleApiService, broadcastTenantContext, clearApiServiceCache } =
      await import("../api-factory");

    const baseService = getBaseApiService();
    const crmService = getModuleApiService("CRM");
    const dtService = getModuleApiService("DATATRANSFER");
    const sharedVenueService = getModuleApiService("VENUE");

    expect(sharedVenueService).toBe(baseService);
    expect(crmService).not.toBe(baseService);
    expect(dtService).not.toBe(baseService);
    expect(createdInstances).toHaveLength(3);

    broadcastTenantContext("enc-tenant-42");

    for (const instance of createdInstances) {
      expect(instance.setTenantContext).toHaveBeenCalledTimes(1);
      expect(instance.setTenantContext).toHaveBeenCalledWith("enc-tenant-42");
    }

    broadcastTenantContext(null);

    for (const instance of createdInstances) {
      expect(instance.setTenantContext).toHaveBeenCalledTimes(2);
      expect(instance.setTenantContext).toHaveBeenLastCalledWith(null);
    }

    clearApiServiceCache();
  });

  it("applies the active broadcast tenantId to lazily constructed module services", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.test/api");
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_API_URL", "https://identity.scripe.test/api");

    const { broadcastTenantContext, getModuleApiService, clearApiServiceCache } = await import(
      "../api-factory"
    );

    broadcastTenantContext("enc-tenant-99");

    getModuleApiService("IDENTITY");
    expect(createdInstances).toHaveLength(1);
    expect(createdInstances[0].baseUrl).toBe("https://identity.scripe.test/api");
    expect(createdInstances[0].setTenantContext).toHaveBeenCalledWith("enc-tenant-99");

    clearApiServiceCache();
    broadcastTenantContext(null);
  });

  it("clearApiServiceCache resets cached instances and active broadcast state", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.test/api");

    const { broadcastTenantContext, clearApiServiceCache, getBaseApiService } = await import(
      "../api-factory"
    );

    const firstBase = getBaseApiService();
    broadcastTenantContext("enc-tenant-10");
    expect(createdInstances[0].setTenantContext).toHaveBeenCalledWith("enc-tenant-10");

    clearApiServiceCache();
    const secondBase = getBaseApiService();

    expect(secondBase).not.toBe(firstBase);
    expect(createdInstances).toHaveLength(2);
    expect(createdInstances[1].setTenantContext).not.toHaveBeenCalled();
  });
});
