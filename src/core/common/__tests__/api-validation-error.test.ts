import { describe, it, expect } from "vitest";
import { parseApiValidationError } from "../api-validation-error";

describe("parseApiValidationError", () => {
  it("extracts and normalizes field errors from error.details.errors (RFC 7807 Problem Details)", () => {
    const error = {
      details: {
        title: "One or more validation errors occurred.",
        errors: {
          Key: ["Key must start with a lowercase letter", "Another key error"],
          LabelEn: ["LabelEn is required"],
        },
      },
    };

    const result = parseApiValidationError(error, ["key", "labelEn"]);

    expect(result.hasFieldErrors).toBe(true);
    expect(result.fieldErrors).toEqual({
      key: "Key must start with a lowercase letter",
      labelEn: "LabelEn is required",
    });
    expect(result.summaryMessage).toBe("Key must start with a lowercase letter");
  });

  it("extracts from error.response.data.errors and normalizes with camelCase without knownFieldNames", () => {
    const error = {
      response: {
        data: {
          errors: {
            "$.FirstName": ["First name is invalid"],
            LastName: ["Last name is required"],
          },
        },
      },
    };

    const result = parseApiValidationError(error);

    expect(result.hasFieldErrors).toBe(true);
    expect(result.fieldErrors).toEqual({
      firstName: "First name is invalid",
      lastName: "Last name is required",
    });
    expect(result.summaryMessage).toBe("First name is invalid");
  });

  it("extracts from direct error.errors with string values", () => {
    const error = {
      errors: {
        email: "Invalid email address",
      },
    };

    const result = parseApiValidationError(error);

    expect(result.hasFieldErrors).toBe(true);
    expect(result.fieldErrors).toEqual({
      email: "Invalid email address",
    });
    expect(result.summaryMessage).toBe("Invalid email address");
  });

  it("extracts summaryMessage when no field errors are present", () => {
    const errorWithTitle = {
      details: {
        title: "Conflict detected",
      },
    };
    expect(parseApiValidationError(errorWithTitle).summaryMessage).toBe("Conflict detected");

    const errorWithMessage = new Error("Network request failed");
    expect(parseApiValidationError(errorWithMessage).summaryMessage).toBe("Network request failed");
  });

  it("handles null, undefined, and non-object inputs safely", () => {
    expect(parseApiValidationError(null)).toEqual({
      fieldErrors: {},
      summaryMessage: undefined,
      hasFieldErrors: false,
    });
    expect(parseApiValidationError(undefined)).toEqual({
      fieldErrors: {},
      summaryMessage: undefined,
      hasFieldErrors: false,
    });
    expect(parseApiValidationError("error string")).toEqual({
      fieldErrors: {},
      summaryMessage: undefined,
      hasFieldErrors: false,
    });
  });
});
