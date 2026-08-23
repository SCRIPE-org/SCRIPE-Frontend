/**
 * SchemaImportModel — Wave 6 row 6.5's import half
 *
 * Two things worth pinning here:
 *
 *  1. `looksLikeSchemaBundlePayload` catches an unrelated JSON file locally, without mistaking a
 *     well-shaped-but-empty bundle for a bad one.
 *  2. The RESULT mapping (`ImportSchemaBundleResultModel.fromJson` -> `SchemaImportMapper.toEntity`)
 *     carries every field through, one assertion per field -- the same discipline every mapper test
 *     in this module follows, because a dropped field here would mean a Skipped group's `reason`
 *     silently reads as `null` on the one screen an admin needs it to be visible.
 */
import { describe, it, expect } from "vitest";
import {
  ImportSchemaBundleFailureModel,
  ImportSchemaBundleResultModel,
  TOO_MANY_ROWS_ERROR_CODE,
  UNKNOWN_ERROR_CODE,
  looksLikeSchemaBundlePayload,
  type ImportSchemaBundleResponseJson,
} from "./SchemaImportModel";
import { SchemaImportMapper } from "../mappers/SchemaImportMapper";

describe("looksLikeSchemaBundlePayload", () => {
  it("accepts a well-shaped bundle, even an empty one", () => {
    expect(
      looksLikeSchemaBundlePayload({ formatVersion: 1, entityTypeKey: null, groups: [], definitions: [] })
    ).toBe(true);
  });

  it("rejects an unrelated JSON file", () => {
    expect(looksLikeSchemaBundlePayload({ hello: "world" })).toBe(false);
  });

  it("rejects a bundle missing any one of the three required members", () => {
    expect(looksLikeSchemaBundlePayload({ groups: [], definitions: [] })).toBe(false);
    expect(looksLikeSchemaBundlePayload({ formatVersion: 1, definitions: [] })).toBe(false);
    expect(looksLikeSchemaBundlePayload({ formatVersion: 1, groups: [] })).toBe(false);
  });

  it("rejects primitives, arrays and null -- not just 'not an object'", () => {
    expect(looksLikeSchemaBundlePayload(null)).toBe(false);
    expect(looksLikeSchemaBundlePayload("not a bundle")).toBe(false);
    expect(looksLikeSchemaBundlePayload([])).toBe(false);
    expect(looksLikeSchemaBundlePayload(42)).toBe(false);
  });

  it("rejects a bundle whose groups/definitions are the wrong type", () => {
    expect(
      looksLikeSchemaBundlePayload({ formatVersion: 1, groups: "nope", definitions: [] })
    ).toBe(false);
  });
});

describe("ImportSchemaBundleResultModel / SchemaImportMapper — the result mapping", () => {
  const RESPONSE: ImportSchemaBundleResponseJson = {
    groups: [
      {
        entityTypeKey: "party.person",
        stableKey: "hr_basics",
        outcome: "Created",
        reason: null,
        fieldsCreated: 3,
      },
      {
        entityTypeKey: "party.person",
        stableKey: "legal_info",
        outcome: "Skipped",
        reason: "A field group with this key already exists.",
        fieldsCreated: 0,
      },
      {
        entityTypeKey: "media.file",
        stableKey: "bad_group",
        outcome: "Failed",
        reason: "'media.filex' is not a registered entity type",
        fieldsCreated: 0,
      },
    ],
  };

  it("carries every group field through, one assertion per field", () => {
    const entity = SchemaImportMapper.toEntity(ImportSchemaBundleResultModel.fromJson(RESPONSE));

    expect(entity.groups).toHaveLength(3);

    expect(entity.groups[0]).toEqual({
      entityTypeKey: "party.person",
      stableKey: "hr_basics",
      outcome: "Created",
      reason: null,
      fieldsCreated: 3,
    });

    // THE assertion this file exists for: the Skipped group's reason must survive intact, since it
    // is the one thing an admin needs to see to act on it.
    expect(entity.groups[1].reason).toBe("A field group with this key already exists.");
    expect(entity.groups[1].outcome).toBe("Skipped");

    expect(entity.groups[2].outcome).toBe("Failed");
    expect(entity.groups[2].reason).toContain("not a registered entity type");
  });

  it("computes counts from the groups, not from a second, separately-trusted source", () => {
    const entity = SchemaImportMapper.toEntity(ImportSchemaBundleResultModel.fromJson(RESPONSE));

    expect(entity.createdCount).toBe(1);
    expect(entity.skippedCount).toBe(1);
    expect(entity.failedCount).toBe(1);
    expect(entity.isEmpty).toBe(false);
  });

  it("reports isEmpty for a bundle that named zero groups", () => {
    const entity = SchemaImportMapper.toEntity(ImportSchemaBundleResultModel.fromJson({ groups: [] }));

    expect(entity.isEmpty).toBe(true);
    expect(entity.createdCount).toBe(0);
  });

  it("guards a response missing the groups array entirely", () => {
    const entity = SchemaImportMapper.toEntity(
      ImportSchemaBundleResultModel.fromJson({} as ImportSchemaBundleResponseJson)
    );

    expect(entity.groups).toEqual([]);
  });
});

describe("SchemaImportMapper — the error direction", () => {
  it("tells the item-count refusal apart from every other shape refusal", () => {
    const tooManyRows = SchemaImportMapper.toError(
      ImportSchemaBundleFailureModel.fromJson({
        statusCode: 422,
        errorCode: TOO_MANY_ROWS_ERROR_CODE,
        message: "This file has more than 10000 groups and fields combined.",
        errors: null,
      })
    );
    expect(tooManyRows.isTooManyRows).toBe(true);

    const malformed = SchemaImportMapper.toError(
      ImportSchemaBundleFailureModel.fromJson({
        statusCode: 422,
        errorCode: "VALIDATION_INVALID_FORMAT",
        message: "This bundle was exported in a format this app does not understand.",
        errors: null,
      })
    );
    expect(malformed.isTooManyRows).toBe(false);

    const transport = SchemaImportMapper.toError(
      ImportSchemaBundleFailureModel.fromUnknown("Network Error")
    );
    expect(transport.errorCode).toBe(UNKNOWN_ERROR_CODE);
    expect(transport.isTooManyRows).toBe(false);
    expect(transport.statusCode).toBe(0);
  });

  it("is an Error, so it survives being thrown and caught by type", () => {
    const error = SchemaImportMapper.toError(
      ImportSchemaBundleFailureModel.fromUnknown("Network Error")
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("SchemaImportError");
  });
});
