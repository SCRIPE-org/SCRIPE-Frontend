import { describe, expect, it } from "vitest";
import { mapVenueError } from "./venueErrorMapper";

describe("mapVenueError", () => {
  it("maps facility.quotaExceeded to friendly branch limit message and billing action", () => {
    const error = { response: { data: { code: "facility.quotaExceeded" } } };
    const mappedEn = mapVenueError(error, "en");
    expect(mappedEn.code).toBe("QUOTA_EXCEEDED");
    expect(mappedEn.message).toContain("Branch limit reached");
    expect(mappedEn.action?.href).toBe("/billing");

    const mappedAr = mapVenueError(error, "ar");
    expect(mappedAr.message).toContain("تم الوصول إلى الحد الأقصى للفروع");
  });

  it("suppresses raw VenueProfileId validation error and returns client-safe message", () => {
    const error = { message: "The VenueProfileId field is required." };
    const mapped = mapVenueError(error, "en");
    expect(mapped.code).toBe("SETUP_CONTEXT_MISSING");
    expect(mapped.message).not.toContain("VenueProfileId");
  });

  it("maps unpublished court error to COURT_NOT_READY with setup CTA", () => {
    const error = { response: { data: { code: "resource.notPublished" } } };
    const mapped = mapVenueError(error, "en");
    expect(mapped.code).toBe("COURT_NOT_READY");
    expect(mapped.action?.href).toBe("/venue/resources");
  });

  it("maps 403 forbidden error to client permission message", () => {
    const error = { response: { status: 403 } };
    const mapped = mapVenueError(error, "en");
    expect(mapped.code).toBe("FORBIDDEN");
    expect(mapped.message).toContain("permission");
  });

  it("maps 409 conflict error to concurrency message", () => {
    const error = { response: { status: 409 } };
    const mapped = mapVenueError(error, "en");
    expect(mapped.code).toBe("CONFLICT");
  });

  it("maps network errors correctly", () => {
    const error = { code: "ERR_NETWORK" };
    const mapped = mapVenueError(error, "en");
    expect(mapped.code).toBe("NETWORK_ERROR");
  });
});
