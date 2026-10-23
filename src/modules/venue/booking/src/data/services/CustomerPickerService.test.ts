import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { CustomerPickerService } from "./CustomerPickerService";

describe("CustomerPickerService", () => {
  const api = {
    get: vi.fn(),
  } as unknown as IApiService;

  beforeEach(() => vi.clearAllMocks());

  it("searches the tenant Party API without duplicating Party ownership", async () => {
    vi.mocked(api.get).mockResolvedValue({
      items: [{ id: "party-1", type: "Person", displayName: "Mona Hassan" }],
      totalCount: 1,
    });

    const result = await new CustomerPickerService(api).search("Mona");

    expect(api.get).toHaveBeenCalledWith("/v1/Parties?page=1&pageSize=20&search=Mona");
    expect(result).toEqual([{ id: "party-1", type: "Person", displayName: "Mona Hassan" }]);
  });

  it("hydrates the selected customer from Party by id", async () => {
    vi.mocked(api.get).mockResolvedValue({
      id: "party-1",
      type: "Person",
      displayName: "Mona Hassan",
    });

    const result = await new CustomerPickerService(api).getById("party-1");

    expect(api.get).toHaveBeenCalledWith("/v1/Parties/party-1");
    expect(result.displayName).toBe("Mona Hassan");
  });

  it("creates customer Organization atomically and creates primary phone contact point when provided", async () => {
    const postMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/v1/Parties/organizations") return Promise.resolve({ id: "party-org-1" });
      if (url === "/v1/contact-points") return Promise.resolve({ id: "contact-1" });
      return Promise.resolve({});
    });

    const mockApi = {
      get: vi.fn().mockResolvedValue({
        id: "party-org-1",
        type: "Organization",
        displayName: "Al-Amal Club",
      }),
      post: postMock,
    } as unknown as IApiService;

    const result = await new CustomerPickerService(mockApi).create(
      "Al-Amal Club",
      "Organization",
      "+966551122334"
    );

    expect(postMock).toHaveBeenCalledWith(
      "/v1/Parties/organizations",
      {
        legalName: "Al-Amal Club",
        displayName: "Al-Amal Club",
      },
      undefined,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Idempotency-Key": expect.any(String),
        }),
      })
    );
    expect(postMock).toHaveBeenCalledWith(
      "/v1/contact-points",
      {
        partyId: "party-org-1",
        type: "Phone",
        value: "+966551122334",
        isPrimary: true,
      },
      undefined,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Idempotency-Key": expect.stringMatching(/:phone$/),
        }),
      })
    );
    expect(result.displayName).toBe("Al-Amal Club");
  });

  it("creates customer Person atomically and attaches primary phone contact point when provided", async () => {
    const postMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/v1/Parties/people") return Promise.resolve({ id: "party-person-1" });
      if (url === "/v1/contact-points") return Promise.resolve({ id: "contact-1" });
      return Promise.resolve({});
    });

    const mockApi = {
      get: vi.fn().mockResolvedValue({
        id: "party-person-1",
        type: "Person",
        displayName: "Sami Al-Harbi",
      }),
      post: postMock,
    } as unknown as IApiService;

    const result = await new CustomerPickerService(mockApi).create(
      "Sami Al-Harbi",
      "Person",
      "+966551122334"
    );

    expect(postMock).toHaveBeenCalledWith(
      "/v1/Parties/people",
      {
        fullName: "Sami Al-Harbi",
        displayName: "Sami Al-Harbi",
        givenName: null,
        middleNames: null,
        familyName: null,
      },
      undefined,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Idempotency-Key": expect.any(String),
        }),
      })
    );
    expect(postMock).toHaveBeenCalledWith(
      "/v1/contact-points",
      {
        partyId: "party-person-1",
        type: "Phone",
        value: "+966551122334",
        isPrimary: true,
      },
      undefined,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Idempotency-Key": expect.stringMatching(/:phone$/),
        }),
      })
    );
    expect(result.displayName).toBe("Sami Al-Harbi");
  });

  it("reuses caller-provided idempotency key across retries of the same intent", async () => {
    const postMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/v1/Parties/organizations") return Promise.resolve({ id: "party-org-1" });
      if (url === "/v1/contact-points") return Promise.resolve({ id: "contact-1" });
      return Promise.resolve({});
    });

    const mockApi = {
      get: vi.fn().mockResolvedValue({
        id: "party-org-1",
        type: "Organization",
        displayName: "Riyadh Sports Hub",
      }),
      post: postMock,
    } as unknown as IApiService;

    const callerKey = "intent-key-12345";
    await new CustomerPickerService(mockApi).create(
      "Riyadh Sports Hub",
      "Organization",
      "+966550000000",
      { idempotencyKey: callerKey }
    );

    expect(postMock).toHaveBeenCalledWith(
      "/v1/Parties/organizations",
      expect.anything(),
      undefined,
      { headers: { "Idempotency-Key": callerKey } }
    );
    expect(postMock).toHaveBeenCalledWith("/v1/contact-points", expect.anything(), undefined, {
      headers: { "Idempotency-Key": `${callerKey}:phone` },
    });
  });

  it("surfaces partial save error by throwing PartialCustomerSaveError when no callback is provided", async () => {
    const postMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/v1/Parties/people") return Promise.resolve({ id: "party-p-failed-phone" });
      if (url === "/v1/contact-points")
        return Promise.reject(new Error("ContactPoint service timeout"));
      return Promise.resolve({});
    });

    const mockApi = {
      get: vi.fn(),
      post: postMock,
    } as unknown as IApiService;

    const service = new CustomerPickerService(mockApi);
    await expect(service.create("Majid Abdullah", "Person", "+966559998888")).rejects.toThrow(
      "Customer was created with ID party-p-failed-phone, but saving the phone number failed."
    );
  });

  it("reconciles partial contact point failure via onContactPointFailure callback without swallowing error", async () => {
    const postMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/v1/Parties/people") return Promise.resolve({ id: "party-p-callback" });
      if (url === "/v1/contact-points") return Promise.reject(new Error("Network glitch"));
      return Promise.resolve({});
    });

    const mockApi = {
      get: vi.fn().mockResolvedValue({
        id: "party-p-callback",
        type: "Person",
        displayName: "Majid Abdullah",
      }),
      post: postMock,
    } as unknown as IApiService;

    const failureCallback = vi.fn();
    const result = await new CustomerPickerService(mockApi).create(
      "Majid Abdullah",
      "Person",
      "+966559998888",
      { onContactPointFailure: failureCallback }
    );

    expect(failureCallback).toHaveBeenCalledWith(expect.any(Error), "party-p-callback");
    expect(result.displayName).toBe("Majid Abdullah");
  });
});
