import { AxiosError, AxiosHeaders } from "axios";
import type { AxiosAdapter, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";
import { ApiService } from "../api.service";

type RequestHandler = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

function requestHandler(service: ApiService): RequestHandler {
  const instance = axiosInstance(service);
  const handlers = (
    instance.interceptors.request as unknown as {
      handlers: Array<{ fulfilled?: RequestHandler } | null>;
    }
  ).handlers;
  const handler = handlers.find((entry) => typeof entry?.fulfilled === "function")?.fulfilled;

  if (!handler) {
    throw new Error("ApiService registered no request interceptor");
  }

  return handler;
}

function axiosInstance(service: ApiService): AxiosInstance {
  return (service as unknown as { axiosInstance: AxiosInstance }).axiosInstance;
}

function mutationConfig(headers: Record<string, string> = {}): InternalAxiosRequestConfig {
  return {
    method: "post",
    url: "/v1/operations",
    headers: new AxiosHeaders(headers),
  } as InternalAxiosRequestConfig;
}

function unavailableResponseError(): AxiosError {
  const config = mutationConfig();
  return new AxiosError("Request failed with status code 503", "ERR_BAD_RESPONSE", config, undefined, {
    status: 503,
    statusText: "Service Unavailable",
    headers: {},
    config,
    data: {},
  });
}

describe("ApiService business intent and replay nonce separation", () => {
  it("adds a transport nonce without inventing an idempotency key", () => {
    const service = new ApiService("/api");
    const config = requestHandler(service)(mutationConfig());

    expect(config.headers.get("X-Request-Nonce")).toEqual(expect.any(String));
    expect(config.headers.get("X-Request-Timestamp")).toEqual(expect.any(String));
    expect(config.headers.get("Idempotency-Key")).toBeUndefined();
  });

  it("preserves a business intent key while refreshing the transport nonce per attempt", () => {
    const service = new ApiService("/api");
    const handle = requestHandler(service);
    const first = handle(mutationConfig({ "Idempotency-Key": "booking-confirm-123" }));
    const second = handle(
      mutationConfig({
        "Idempotency-Key": first.headers.get("Idempotency-Key") as string,
        "X-Request-Nonce": first.headers.get("X-Request-Nonce") as string,
      })
    );

    expect(first.headers.get("Idempotency-Key")).toBe("booking-confirm-123");
    expect(second.headers.get("Idempotency-Key")).toBe("booking-confirm-123");
    expect(second.headers.get("X-Request-Nonce")).not.toBe(first.headers.get("X-Request-Nonce"));
  });

  it("does not retry a POST without an explicit business intent key", async () => {
    const service = new ApiService("/api");
    const post = vi.spyOn(service, "post").mockRejectedValue(unavailableResponseError());

    await expect(service.postWithRetry("/v1/operations", {})).rejects.toBeInstanceOf(AxiosError);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("retries a keyed POST with the same business intent key", async () => {
    const service = new ApiService("/api");
    const post = vi
      .spyOn(service, "post")
      .mockRejectedValueOnce(unavailableResponseError())
      .mockResolvedValueOnce({ ok: true });
    const internals = service as unknown as {
      getRetryDelay: (attempt: number) => number;
      sleep: (duration: number) => Promise<void>;
    };
    vi.spyOn(internals, "getRetryDelay").mockReturnValue(0);
    vi.spyOn(internals, "sleep").mockResolvedValue();

    await expect(
      service.postWithRetry("/v1/operations", {}, undefined, {
        headers: { "Idempotency-Key": "booking-confirm-123" },
      })
    ).resolves.toEqual({ ok: true });

    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls[0]?.[3]?.headers?.["Idempotency-Key"]).toBe("booking-confirm-123");
    expect(post.mock.calls[1]?.[3]?.headers?.["Idempotency-Key"]).toBe("booking-confirm-123");
  });

  it("does not retry a PUT without an explicit business intent key", async () => {
    const service = new ApiService("/api");
    const put = vi.spyOn(service, "put").mockRejectedValue(unavailableResponseError());

    await expect(service.putWithRetry("/v1/operations/123", {})).rejects.toBeInstanceOf(AxiosError);
    expect(put).toHaveBeenCalledTimes(1);
  });

  it("retries a keyed PUT with the same business intent key", async () => {
    const service = new ApiService("/api");
    const put = vi
      .spyOn(service, "put")
      .mockRejectedValueOnce(unavailableResponseError())
      .mockResolvedValueOnce({ ok: true });
    const internals = service as unknown as {
      getRetryDelay: (attempt: number) => number;
      sleep: (duration: number) => Promise<void>;
    };
    vi.spyOn(internals, "getRetryDelay").mockReturnValue(0);
    vi.spyOn(internals, "sleep").mockResolvedValue();

    await expect(
      service.putWithRetry("/v1/operations/123", {}, undefined, {
        headers: { "Idempotency-Key": "booking-confirm-123" },
      })
    ).resolves.toEqual({ ok: true });

    expect(put).toHaveBeenCalledTimes(2);
    expect(put.mock.calls[0]?.[3]?.headers?.["Idempotency-Key"]).toBe("booking-confirm-123");
    expect(put.mock.calls[1]?.[3]?.headers?.["Idempotency-Key"]).toBe("booking-confirm-123");
  });

  it("keeps the business key and refreshes the nonce across an actual 503 retry", async () => {
    const service = new ApiService("/api");
    const instance = axiosInstance(service);
    const requests: InternalAxiosRequestConfig[] = [];
    const internals = service as unknown as {
      getRetryDelay: (attempt: number) => number;
      sleep: (duration: number) => Promise<void>;
    };
    vi.spyOn(internals, "getRetryDelay").mockReturnValue(0);
    vi.spyOn(internals, "sleep").mockResolvedValue();

    instance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      requests.push(config as InternalAxiosRequestConfig);
      if (requests.length === 1) {
        throw new AxiosError("Request failed with status code 503", "ERR_BAD_RESPONSE", config, undefined, {
          status: 503,
          statusText: "Service Unavailable",
          headers: {},
          config,
          data: {},
        });
      }

      return {
        data: { data: { ok: true } },
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders(),
        config,
      };
    });

    await expect(
      service.postWithRetry("/v1/operations", {}, undefined, {
        headers: { "Idempotency-Key": "booking-confirm-123" },
      })
    ).resolves.toEqual({ ok: true });

    expect(requests).toHaveLength(2);
    expect(requests.map((request) => request.headers.get("Idempotency-Key"))).toEqual([
      "booking-confirm-123",
      "booking-confirm-123",
    ]);
    expect(requests[1]?.headers.get("X-Request-Nonce")).not.toBe(
      requests[0]?.headers.get("X-Request-Nonce")
    );
  });

  it("keeps the business key and refreshes the nonce across an actual 401 refresh", async () => {
    const service = new ApiService("/api");
    const instance = axiosInstance(service);
    const requests: InternalAxiosRequestConfig[] = [];
    const refresh = vi.fn().mockResolvedValue("refreshed-access-token");
    service.setRefreshHandler(refresh);

    instance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      requests.push(config as InternalAxiosRequestConfig);
      if (requests.length === 1) {
        throw new AxiosError("Request failed with status code 401", "ERR_BAD_REQUEST", config, undefined, {
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
          data: {},
        });
      }

      return {
        data: { data: { ok: true } },
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders(),
        config,
      };
    });

    await expect(
      service.post("/v1/operations", {}, undefined, {
        headers: { "Idempotency-Key": "booking-confirm-123" },
      })
    ).resolves.toEqual({ ok: true });

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(2);
    expect(requests.map((request) => request.headers.get("Idempotency-Key"))).toEqual([
      "booking-confirm-123",
      "booking-confirm-123",
    ]);
    expect(requests[1]?.headers.get("X-Request-Nonce")).not.toBe(
      requests[0]?.headers.get("X-Request-Nonce")
    );
  });

  it("keeps the business key and refreshes the nonce after an actual network failure", async () => {
    const service = new ApiService("/api");
    const instance = axiosInstance(service);
    const requests: InternalAxiosRequestConfig[] = [];
    const internals = service as unknown as {
      getRetryDelay: (attempt: number) => number;
      sleep: (duration: number) => Promise<void>;
    };
    vi.spyOn(internals, "getRetryDelay").mockReturnValue(0);
    vi.spyOn(internals, "sleep").mockResolvedValue();

    instance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      requests.push(config as InternalAxiosRequestConfig);
      if (requests.length === 1) {
        throw new AxiosError("Network Error", "ERR_NETWORK", config);
      }

      return {
        data: { data: { ok: true } },
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders(),
        config,
      };
    });

    await expect(
      service.postWithRetry("/v1/operations", {}, undefined, {
        headers: { "Idempotency-Key": "booking-confirm-123" },
      })
    ).resolves.toEqual({ ok: true });

    expect(requests).toHaveLength(2);
    expect(requests.map((request) => request.headers.get("Idempotency-Key"))).toEqual([
      "booking-confirm-123",
      "booking-confirm-123",
    ]);
    expect(requests[1]?.headers.get("X-Request-Nonce")).not.toBe(
      requests[0]?.headers.get("X-Request-Nonce")
    );
  });
});
