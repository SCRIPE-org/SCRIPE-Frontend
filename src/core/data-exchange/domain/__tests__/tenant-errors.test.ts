import { describe, expect, it } from "vitest";
import { isTenantRequiredError } from "../tenant-errors";

describe("isTenantRequiredError", () => {
  it("detects ApiService 422 errors carrying details.errorCode DataTransfer.TenantRequired", () => {
    const apiServiceError = {
      status: 422,
      code: "ERR_BAD_REQUEST",
      message: "Tenant context is required for data transfer operations.",
      details: {
        errorCode: "DataTransfer.TenantRequired",
        title: "Tenant Required",
      },
    };

    expect(isTenantRequiredError(apiServiceError)).toBe(true);
  });

  it("detects raw Axios 422 errors carrying response.data.errorCode", () => {
    const axiosError = {
      response: {
        status: 422,
        data: {
          errorCode: "DataTransfer.TenantRequired",
        },
      },
    };

    expect(isTenantRequiredError(axiosError)).toBe(true);
  });

  it("detects direct code, errorCode, or string payloads matching DataTransfer.TenantRequired", () => {
    expect(isTenantRequiredError({ errorCode: "DataTransfer.TenantRequired" })).toBe(true);
    expect(isTenantRequiredError({ code: "DataTransfer.TenantRequired" })).toBe(true);
    expect(isTenantRequiredError("DataTransfer.TenantRequired")).toBe(true);
    expect(isTenantRequiredError("Tenant context is required")).toBe(true);
  });

  it("detects 422 status with tenant context/required wording in details or message", () => {
    expect(
      isTenantRequiredError({
        status: 422,
        details: { detail: "An active tenant context is required in platform mode." },
      })
    ).toBe(true);
  });

  it("returns false for nullish, non-tenant 422 validation errors, and 500 errors", () => {
    expect(isTenantRequiredError(null)).toBe(false);
    expect(isTenantRequiredError(undefined)).toBe(false);
    expect(
      isTenantRequiredError({
        status: 422,
        details: {
          errorCode: "Validation.Failed",
          detail: "File format is invalid.",
        },
      })
    ).toBe(false);
    expect(
      isTenantRequiredError({
        status: 500,
        message: "Internal server error",
      })
    ).toBe(false);
  });
});
