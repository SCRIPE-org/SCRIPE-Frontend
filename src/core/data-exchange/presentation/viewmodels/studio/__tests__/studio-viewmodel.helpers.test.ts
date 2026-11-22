import { describe, it, expect } from "vitest";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import {
  extractErrorStatus,
  getStudioErrorMessage,
  isAbortOrInterceptedError,
  MAX_UPLOAD_BYTES,
  validateUploadFileClientSide,
} from "../studio-viewmodel.helpers";

describe("studio-viewmodel.helpers", () => {
  const t = (key: string) => key;

  it("validates upload extension (.xlsx, .csv, .tsv) and 25 MB limit client-side", () => {
    expect(
      validateUploadFileClientSide(new File(["a"], "leads.xlsx"), t)
    ).toBeNull();
    expect(
      validateUploadFileClientSide(new File(["a"], "leads.CSV"), t)
    ).toBeNull();
    expect(
      validateUploadFileClientSide(new File(["a"], "leads.tsv"), t)
    ).toBeNull();
    expect(
      validateUploadFileClientSide(new File(["a"], "malware.exe"), t)
    ).toBe("dataExchange.errors.invalidFileType");

    const hugeFile = { name: "huge.xlsx", size: MAX_UPLOAD_BYTES + 1 } as File;
    expect(validateUploadFileClientSide(hugeFile, t)).toBe(
      "dataExchange.errors.fileTooLarge"
    );
  });

  it("extracts details, response.data, and validation errors[] in getStudioErrorMessage", () => {
    const errWithArray = {
      message: "HTTP 422",
      details: {
        message: "Import validation failed",
        errors: [{ message: "Email is required" }, "Phone is invalid"],
      },
    };
    expect(getStudioErrorMessage(errWithArray, "fallback")).toBe(
      "Import validation failed: Email is required; Phone is invalid"
    );

    const errWithRecord = {
      message: "HTTP 400",
      response: {
        data: {
          errors: { file: ["File exceeds row limit."] },
        },
      },
    };
    expect(getStudioErrorMessage(errWithRecord, "fallback")).toBe(
      "File exceeds row limit."
    );

    expect(getStudioErrorMessage({ message: "HTTP 500" }, "fallback")).toBe("fallback");
    expect(getStudioErrorMessage(null, "fallback")).toBe("fallback");
  });

  it("identifies abort/intercepted errors and HTTP status codes", () => {
    expect(isAbortOrInterceptedError(new DownloadInterceptedError())).toBe(true);
    expect(isAbortOrInterceptedError({ name: "AbortError" })).toBe(true);
    expect(isAbortOrInterceptedError({ code: "ERR_CANCELED" })).toBe(true);
    expect(isAbortOrInterceptedError(new Error("Boom"))).toBe(false);

    expect(extractErrorStatus({ status: 403 })).toBe(403);
    expect(extractErrorStatus({ response: { status: 404 } })).toBe(404);
    expect(extractErrorStatus({ details: { statusCode: 422 } })).toBe(422);
  });
});
