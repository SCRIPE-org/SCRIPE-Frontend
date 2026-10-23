import { AxiosError, AxiosHeaders, type AxiosInstance, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiService } from "../api.service";
import { appLogger } from "@core/common/logger";

type AuthenticatedInstance = { axiosInstance: AxiosInstance };
type PublicInstance = { axiosPublic: AxiosInstance };

function instanceOf(service: ApiService): AxiosInstance {
  return (service as unknown as AuthenticatedInstance).axiosInstance;
}

function publicInstanceOf(service: ApiService): AxiosInstance {
  return (service as unknown as PublicInstance).axiosPublic;
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

  it("does not auto-retry an in-flight canceled attempt and allows an explicit same-intent retry", async () => {
    const service = new ApiService("/api");
    const requests: AxiosResponse["config"][] = [];
    const axiosInstance = instanceOf(service);
    let markStarted!: () => void;
    const firstAttemptStarted = new Promise<void>((resolve) => {
      markStarted = resolve;
    });

    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config);
      if (requests.length === 1) {
        markStarted();
        return new Promise<AxiosResponse>((_resolve, reject) => {
          config.signal?.addEventListener?.(
            "abort",
            () => reject(new AxiosError("canceled", AxiosError.ERR_CANCELED, config)),
            { once: true }
          );
        });
      }

      return responseFor(200, config);
    };

    const intent = { idempotencyKey: "intent-key-canceled" };
    const controller = new AbortController();
    const logError = vi.spyOn(appLogger, "error");
    const canceledAttempt = service.postWithRetry(
      "/v1/example",
      { value: 1 },
      controller.signal,
      intent
    );

    await firstAttemptStarted;
    controller.abort();
    await expect(canceledAttempt).rejects.toMatchObject({ code: AxiosError.ERR_CANCELED });
    expect(logError).not.toHaveBeenCalled();
    expect(requests).toHaveLength(1);

    await expect(service.postWithRetry("/v1/example", { value: 1 }, undefined, intent)).resolves.toEqual({
      ok: true,
    });

    expect(requests).toHaveLength(2);
    const headers = requests.map((request) => AxiosHeaders.from(request.headers));
    expect(headers.map((entry) => entry.get("Idempotency-Key"))).toEqual([
      "intent-key-canceled",
      "intent-key-canceled",
    ]);
    expect(headers[1].get("X-Request-Nonce")).not.toBe(headers[0].get("X-Request-Nonce"));
  });

  it("preserves caller cancellation for blob downloads while retaining interception detection", async () => {
    const service = new ApiService("/api");
    const axiosInstance = instanceOf(service);
    let markStarted!: () => void;
    const requestStarted = new Promise<void>((resolve) => {
      markStarted = resolve;
    });

    axiosInstance.defaults.adapter = async (config) => {
      markStarted();
      return new Promise<AxiosResponse>((_resolve, reject) => {
        config.signal?.addEventListener?.(
          "abort",
          () => reject(new AxiosError("canceled", AxiosError.ERR_CANCELED, config)),
          { once: true }
        );
      });
    };

    const controller = new AbortController();
    const logError = vi.spyOn(appLogger, "error");
    const canceledDownload = service.getBlob("/v1/files/1", controller.signal);
    await requestStarted;
    controller.abort();

    await expect(canceledDownload).rejects.toMatchObject({ code: AxiosError.ERR_CANCELED });
    expect(logError).not.toHaveBeenCalled();

    axiosInstance.defaults.adapter = async (config) => {
      throw new AxiosError("canceled", AxiosError.ERR_CANCELED, config);
    };

    await expect(service.getBlob("/v1/files/1")).rejects.toMatchObject({
      name: "DownloadInterceptedError",
    });
  });

  it("does not report a blob request timeout as external download interception", async () => {
    const service = new ApiService("/api");
    const axiosInstance = instanceOf(service);

    axiosInstance.defaults.adapter = async (config) => {
      throw new AxiosError("timeout", AxiosError.ECONNABORTED, config);
    };

    await expect(service.getBlob("/v1/files/slow-export")).rejects.toMatchObject({
      code: AxiosError.ECONNABORTED,
    });
  });

  it("preserves public-request cancellation without logging it as an API failure", async () => {
    const service = new ApiService("/api");
    const publicClient = publicInstanceOf(service);
    let markStarted!: () => void;
    const requestStarted = new Promise<void>((resolve) => {
      markStarted = resolve;
    });

    publicClient.defaults.adapter = async (config) => {
      markStarted();
      return new Promise<AxiosResponse>((_resolve, reject) => {
        config.signal?.addEventListener?.(
          "abort",
          () => reject(new AxiosError("canceled", AxiosError.ERR_CANCELED, config)),
          { once: true }
        );
      });
    };

    const controller = new AbortController();
    const logError = vi.spyOn(appLogger, "error");
    const canceledRequest = service.getPublic("/v1/public-resource", undefined, controller.signal);
    await requestStarted;
    controller.abort();

    await expect(canceledRequest).rejects.toMatchObject({ code: AxiosError.ERR_CANCELED });
    expect(logError).not.toHaveBeenCalled();
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
