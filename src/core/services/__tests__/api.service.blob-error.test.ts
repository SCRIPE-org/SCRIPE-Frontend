import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { ApiService } from "../api.service";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";

function makeAxiosRejection(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
  headers: Record<string, string> = {}
) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    config,
    response: {
      status,
      statusText: `HTTP ${status}`,
      headers,
      config,
      data,
    },
  });
}

describe("ApiService blob ErrorResponse decoding", () => {
  let service: ApiService;
  let adapterMock: ReturnType<typeof vi.fn<AxiosAdapter>>;

  beforeEach(() => {
    service = new ApiService("/api");
    adapterMock = vi.fn<AxiosAdapter>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).axiosInstance.defaults.adapter = adapterMock;
  });

  it("decodes JSON ErrorResponse Blob on getBlob 422 rejection including errors[]", async () => {
    const errorPayload = {
      message: "Validation failed",
      errors: ["Column Email is invalid on row 2"],
    };
    const errorBlob = new Blob([JSON.stringify(errorPayload)], {
      type: "application/json",
    });

    adapterMock.mockImplementation(async (config) => {
      throw makeAxiosRejection(config, 422, errorBlob, {
        "content-type": "application/json",
      });
    });

    await expect(service.getBlob("/data-exchange/template")).rejects.toMatchObject({
      message: "Validation failed",
      status: 422,
      details: errorPayload,
    });
  });

  it("decodes JSON ErrorResponse Blob with errors[] when message is absent on postBlob", async () => {
    const errorPayload = {
      errors: { selectedColumns: ["At least one exportable column must be selected."] },
    };
    const errorBlob = new Blob([JSON.stringify(errorPayload)], {
      type: "application/problem+json",
    });

    adapterMock.mockImplementation(async (config) => {
      throw makeAxiosRejection(config, 400, errorBlob, {
        "content-type": "application/problem+json",
      });
    });

    await expect(service.postBlob("/data-exchange/export", {})).rejects.toMatchObject({
      message: "At least one exportable column must be selected.",
      status: 400,
      details: errorPayload,
    });
  });

  it("decodes JSON 403 ErrorResponse Blob into businessError with status and details", async () => {
    const forbiddenPayload = {
      statusCode: 403,
      errorCode: "ENTITLEMENT_DENIED",
      message: "Tenant entitlement does not allow exports.",
    };
    const errorBlob = new Blob([JSON.stringify(forbiddenPayload)], {
      type: "application/json",
    });

    adapterMock.mockImplementation(async (config) => {
      throw makeAxiosRejection(config, 403, errorBlob, {
        "content-type": "application/json",
      });
    });

    await expect(service.getBlob("/data-exchange/jobs/1/artifact")).rejects.toMatchObject({
      message: "Tenant entitlement does not allow exports.",
      status: 403,
      details: forbiddenPayload,
    });
  });

  it("falls back to plain-text decoding when Blob error body is text/plain", async () => {
    const textBlob = new Blob(["Upstream storage quota exceeded"], {
      type: "text/plain",
    });

    adapterMock.mockImplementation(async (config) => {
      throw makeAxiosRejection(config, 500, textBlob, {
        "content-type": "text/plain",
      });
    });

    await expect(service.postBlob("/data-exchange/export", {})).rejects.toMatchObject({
      message: "Upstream storage quota exceeded",
      status: 500,
      details: "Upstream storage quota exceeded",
    });
  });

  it("throws DownloadInterceptedError when external abort occurs on un-aborted blob download", async () => {
    adapterMock.mockImplementation(async (config) => {
      throw Object.assign(new Error("Network Error"), {
        isAxiosError: true,
        code: "ERR_NETWORK",
        config,
      });
    });

    await expect(service.getBlob("/data-exchange/template")).rejects.toBeInstanceOf(
      DownloadInterceptedError
    );
  });
});
