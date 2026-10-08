/**
 * EntityLookupRepository tests (Wave 4)
 *
 * A pass-through has one thing worth testing and it is not the return value: that every argument
 * reaches the service intact, in order, INCLUDING the `AbortSignal`. Dropping the signal is the
 * plausible failure here — the repository compiles perfectly without forwarding it, and the only
 * symptom would be that cancellation silently stops working, which no picker test would catch.
 */
import { describe, it, expect, vi } from "vitest";
import { EntityLookupRepository } from "./EntityLookupRepository";
import type { IEntityLookupService } from "../../domain/interfaces/IEntityLookupService";

function mockService(): IEntityLookupService {
  return {
    getAvailableTypes: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue({ items: [], hasNextPage: false }),
    resolve: vi.fn().mockResolvedValue({
      id: "id",
      displayName: "name",
      secondary: null,
      isActive: true,
    }),
  } as unknown as IEntityLookupService;
}

describe("EntityLookupRepository", () => {
  it("forwards the abort signal to the service on getAvailableTypes", async () => {
    const service = mockService();
    const signal = new AbortController().signal;

    await new EntityLookupRepository(service).getAvailableTypes(signal);

    expect(service.getAvailableTypes).toHaveBeenCalledWith(signal);
  });

  it("forwards the entity type, the whole query and the abort signal on search", async () => {
    const service = mockService();
    const signal = new AbortController().signal;
    const query = { search: "ali", page: 3, pageSize: 20 };

    await new EntityLookupRepository(service).search("hrms.staff-member", query, signal);

    expect(service.search).toHaveBeenCalledWith("hrms.staff-member", query, signal);
  });

  it("forwards the encrypted id unchanged and the abort signal on resolve", async () => {
    const service = mockService();
    const signal = new AbortController().signal;

    await new EntityLookupRepository(service).resolve("hrms.staff-member", "AbC-dEf_123", signal);

    expect(service.resolve).toHaveBeenCalledWith("hrms.staff-member", "AbC-dEf_123", signal);
  });

  it("does not swallow a classified failure", async () => {
    const service = mockService();
    const failure = new Error("boom");
    vi.mocked(service.resolve).mockRejectedValue(failure);

    // A repository that caught and returned null here would erase the whole forbidden/missing/
    // invalid distinction one layer above where it was computed.
    await expect(
      new EntityLookupRepository(service).resolve("hrms.staff-member", "id")
    ).rejects.toBe(failure);
  });
});
