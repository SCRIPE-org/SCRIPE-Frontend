import { AxiosError, AxiosHeaders, type AxiosInstance, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiService } from "../api.service";

type AuthenticatedInstance = { axiosInstance: AxiosInstance };

function instanceOf(service: ApiService): AxiosInstance {
  return (service as unknown as AuthenticatedInstance).axiosInstance;
}

function responseFor(
  status: number,
  config: AxiosResponse["config"],
  data: unknown = { ok: true }
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new AxiosHeaders(),
    config,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ApiService mutation intent", () => {
  it("trims whitespace from the idempotency key sent in the request header", async () => {
    const service = new ApiService("/api");
    const requests: AxiosResponse["config"][] = [];
    const axiosInstance = instanceOf(service);

    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config);
      return responseFor(200, config);
    };

    await expect(
      service.post("/v1/example", { value: 1 }, undefined, {
        idempotencyKey: "  intent-key-padded  ",
      })
    ).resolves.toEqual({ ok: true });

    expect(requests).toHaveLength(1);
    expect(AxiosHeaders.from(requests[0].headers).get("Idempotency-Key")).toBe("intent-key-padded");
  });

  it("reuses one intent key and creates a fresh nonce for an opted-in retry", async () => {
    const service = new ApiService("/api");
    const requests: AxiosResponse["config"][] = [];
    const axiosInstance = instanceOf(service);
    vi.spyOn(
      service as unknown as { getRetryDelay(attempt: number): number },
      "getRetryDelay"
    ).mockReturnValue(0);

    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config);
      const response = responseFor(requests.length === 1 ? 503 : 200, config);
      if (response.status !== 200) {
        throw new AxiosError(
          "Request failed with status code 503",
          AxiosError.ERR_BAD_RESPONSE,
          config,
          undefined,
          response
        );
      }
      return response;
    };

    await expect(
      service.postWithRetry("/v1/example", { value: 1 }, undefined, {
        idempotencyKey: "intent-key-1",
      })
    ).resolves.toEqual({ ok: true });

    expect(requests).toHaveLength(2);
    const headers = requests.map((request) => AxiosHeaders.from(request.headers));
    expect(headers.map((entry) => entry.get("Idempotency-Key"))).toEqual([
      "intent-key-1",
      "intent-key-1",
    ]);
    expect(headers[0].get("X-Request-Nonce")).toBeTruthy();
    expect(headers[1].get("X-Request-Nonce")).toBeTruthy();
    expect(headers[1].get("X-Request-Nonce")).not.toBe(headers[0].get("X-Request-Nonce"));
  });

  it("does not retry a mutation without an explicit durable intent key", async () => {
    const service = new ApiService("/api");
    const requests: AxiosResponse["config"][] = [];
    const axiosInstance = instanceOf(service);
    vi.spyOn(
      service as unknown as { getRetryDelay(attempt: number): number },
      "getRetryDelay"
    ).mockReturnValue(0);

    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config);
      const response = responseFor(503, config);
      throw new AxiosError(
        "Request failed with status code 503",
        AxiosError.ERR_BAD_RESPONSE,
        config,
        undefined,
        response
      );
    };

    await expect(service.postWithRetry("/v1/example", { value: 1 })).rejects.toMatchObject({
      status: 503,
    });
    expect(requests).toHaveLength(1);
  });

  it.each(["", "   "])(
    "does not retry or send an idempotency header for a blank intent key (%j)",
    async (idempotencyKey) => {
      const service = new ApiService("/api");
      const requests: AxiosResponse["config"][] = [];
      const axiosInstance = instanceOf(service);
      vi.spyOn(
        service as unknown as { getRetryDelay(attempt: number): number },
        "getRetryDelay"
      ).mockReturnValue(0);

      axiosInstance.defaults.adapter = async (config) => {
        requests.push(config);
        const response = responseFor(503, config);
        throw new AxiosError(
          "Request failed with status code 503",
          AxiosError.ERR_BAD_RESPONSE,
          config,
          undefined,
          response
        );
      };

      await expect(
        service.postWithRetry("/v1/example", { value: 1 }, undefined, { idempotencyKey })
      ).rejects.toMatchObject({ status: 503 });

      expect(requests).toHaveLength(1);
      expect(AxiosHeaders.from(requests[0].headers).get("Idempotency-Key")).toBeFalsy();
    }
  );

  it("retries a network failure only when the same durable intent key is supplied", async () => {
    const service = new ApiService("/api");
    const requests: AxiosResponse["config"][] = [];
    const axiosInstance = instanceOf(service);
    vi.spyOn(
      service as unknown as { getRetryDelay(attempt: number): number },
      "getRetryDelay"
    ).mockReturnValue(0);

    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config);
      if (requests.length === 1) {
        throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
      }
      return responseFor(200, config);
    };

    await expect(
      service.postWithRetry("/v1/example", { value: 1 }, undefined, {
        idempotencyKey: "intent-key-network",
      })
    ).resolves.toEqual({ ok: true });

    expect(requests).toHaveLength(2);
    const headers = requests.map((request) => AxiosHeaders.from(request.headers));
    expect(headers.map((entry) => entry.get("Idempotency-Key"))).toEqual([
      "intent-key-network",
      "intent-key-network",
    ]);
    expect(headers[1].get("X-Request-Nonce")).not.toBe(headers[0].get("X-Request-Nonce"));
  });

  it("preserves the business key while refreshing and replaying the same mutation", async () => {
    const service = new ApiService("/api");
    const refresh = vi.fn(async () => "fresh-access-token");
    const requests: AxiosResponse["config"][] = [];
    const axiosInstance = instanceOf(service);
    service.setRefreshHandler(refresh);

    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config);
      const response = responseFor(requests.length === 1 ? 401 : 200, config);
      if (response.status === 401) {
        throw new AxiosError(
          "Request failed with status code 401",
          AxiosError.ERR_BAD_REQUEST,
          config,
          undefined,
          response
        );
      }
      return response;
    };

    await expect(
      service.post("/v1/example", { value: 1 }, undefined, { idempotencyKey: "intent-key-2" })
    ).resolves.toEqual({ ok: true });

    expect(refresh).toHaveBeenCalledOnce();
    expect(requests).toHaveLength(2);
    const headers = requests.map((request) => AxiosHeaders.from(request.headers));
    expect(headers.map((entry) => entry.get("Idempotency-Key"))).toEqual([
      "intent-key-2",
      "intent-key-2",
    ]);
    expect(headers[1].get("X-Request-Nonce")).not.toBe(headers[0].get("X-Request-Nonce"));
  });

  it("surfaces a backend conflict when the same intent key is reused with a changed payload", async () => {
    const service = new ApiService("/api");
    const requests: AxiosResponse["config"][] = [];
    const axiosInstance = instanceOf(service);
    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config);
      if (requests.length === 1) {
        return responseFor(200, config, { id: "created" });
      }

      const response = responseFor(409, config, {
        code: "IDEMPOTENCY_KEY_REUSE",
        message: "The key was already used for a different request.",
      });
      throw new AxiosError(
        "Request failed with status code 409",
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response
      );
    };

    const intent = { idempotencyKey: "intent-key-conflict" };
    await expect(
      service.postWithRetry("/v1/example", { value: 1 }, undefined, intent)
    ).resolves.toEqual({ id: "created" });
    await expect(
      service.postWithRetry("/v1/example", { value: 2 }, undefined, intent)
    ).rejects.toMatchObject({
      status: 409,
      details: { code: "IDEMPOTENCY_KEY_REUSE" },
    });

    expect(requests).toHaveLength(2);
    expect(
      requests.map((request) => AxiosHeaders.from(request.headers).get("Idempotency-Key"))
    ).toEqual(["intent-key-conflict", "intent-key-conflict"]);
  });
});
