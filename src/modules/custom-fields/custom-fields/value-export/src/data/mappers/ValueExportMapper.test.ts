/**
 * ValueExportMapper — the full round trip (Wave 6 row 6.4's completion)
 *
 * Same two round trips as `DefinitionExportMapper.test.ts`, and the same reasoning for why the ERROR
 * direction is the dangerous one: dropping `errorCode` collapses the row-cap refusal, the
 * unknown-entity-type refusal AND the forbidden-view-permission refusal into "something broke".
 *
 * Both fixtures populate every nullable with a non-null value, for the identical reason
 * `DefinitionExportMapper.test.ts` documents: a null-heavy fixture is exactly how a dropped field
 * passes unnoticed.
 */
import { describe, it, expect } from "vitest";
import { ValueExportMapper } from "./ValueExportMapper";
import {
  FORBIDDEN_ERROR_CODE,
  MAX_EXPORT_ROWS,
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
  UNKNOWN_ERROR_CODE,
  ValueExportFailureModel,
  ValueExportFileModel,
  XLSX_CONTENT_TYPE,
  buildValueExportFileName,
  formatExportStamp,
  sanitizeEntityTypeKey,
  type ValueExportFailureJson,
  type ValueExportFileJson,
} from "../models/ValueExportModel";

/** A descriptor with no null anywhere -- there is no nullable member on this contract at all. */
const FILE: ValueExportFileJson = {
  entityTypeKey: "party.person",
  fileName: "custom-field-values-party.person-20260821-101500.xlsx",
  contentType: XLSX_CONTENT_TYPE,
  byteSize: 20_480,
};

/** An error body with no null anywhere -- `errors` is the only nullable member and it carries rows. */
const FAILURE: ValueExportFailureJson = {
  statusCode: 422,
  errorCode: ROW_CAP_ERROR_CODE,
  message: `Too many values to export at once (limit ${MAX_EXPORT_ROWS}).`,
  errors: ["rows: 10001", "limit: 10000"],
};

/** Stand-in for the workbook. The mapper must not touch the bytes, so what they are is irrelevant. */
function bytes(size = 20_480, type = XLSX_CONTENT_TYPE): Blob {
  return new Blob([new Uint8Array(size)], { type });
}

/** Every key of the object, so a fixture that forgets one is caught here and not by a reviewer. */
function keysOf(value: object): string[] {
  return Object.keys(value).sort();
}

describe("ValueExportMapper — the file round trip", () => {
  it("returns an identical descriptor after json -> entity -> model -> json", () => {
    const blob = bytes();
    const roundTripped = ValueExportMapper.toModel(
      ValueExportMapper.fromJsonToEntity(FILE, blob)
    ).toJson();

    expect(roundTripped).toEqual(FILE);
    // Not just deep-equal: key ORDER survives too.
    expect(JSON.stringify(roundTripped)).toBe(JSON.stringify(FILE));
  });

  it("carries every descriptor field through, one assertion per field", () => {
    const entity = ValueExportMapper.fromJsonToEntity(FILE, bytes());

    expect(entity.entityTypeKey).toBe("party.person");
    expect(entity.fileName).toBe("custom-field-values-party.person-20260821-101500.xlsx");
    expect(entity.contentType).toBe(XLSX_CONTENT_TYPE);
    expect(entity.byteSize).toBe(20_480);
  });

  it("hands over the SAME blob instance, never a re-wrapped copy", () => {
    const blob = bytes();
    const entity = ValueExportMapper.fromJsonToEntity(FILE, blob);

    expect(entity.blob).toBe(blob);
    expect(ValueExportMapper.toModel(entity).blob).toBe(blob);
  });

  it("maps the same key set the wire shape declares, in both directions", () => {
    const entity = ValueExportMapper.fromJsonToEntity(FILE, bytes());
    const emitted = ValueExportMapper.toModel(entity).toJson();

    expect(keysOf(emitted)).toEqual(keysOf(FILE));
    expect(keysOf(entity.data)).toEqual(keysOf({ ...FILE, blob: null }));
  });

  it("keeps the file fixture honest: no field is left unexercised", () => {
    for (const [key, value] of Object.entries(FILE)) {
      expect(value, `file.${key}`).not.toBeNull();
      expect(value, `file.${key}`).not.toBeUndefined();
    }
  });
});

describe("ValueExportMapper — the error round trip", () => {
  it("returns an identical error body after json -> model -> json", () => {
    const roundTripped = ValueExportFailureModel.fromJson(FAILURE).toJson();

    expect(roundTripped).toEqual(FAILURE);
    expect(JSON.stringify(roundTripped)).toBe(JSON.stringify(FAILURE));
  });

  it("carries every error field into the domain error, one assertion per field", () => {
    const error = ValueExportMapper.fromJsonToError(FAILURE);

    expect(error.statusCode).toBe(422);
    expect(error.errorCode).toBe(ROW_CAP_ERROR_CODE);
    expect(error.message).toBe(FAILURE.message);
    expect(error.details).toEqual(["rows: 10001", "limit: 10000"]);
  });

  it("keeps the failure fixture honest: no nullable field is left unexercised", () => {
    for (const [key, value] of Object.entries(FAILURE)) {
      expect(value, `failure.${key}`).not.toBeNull();
      expect(value, `failure.${key}`).not.toBeUndefined();
    }
  });

  it("normalises an omitted errors list to an explicit null", () => {
    const emitted = ValueExportFailureModel.fromJson({
      ...FAILURE,
      errors: undefined,
    } as unknown as ValueExportFailureJson).toJson();

    expect(emitted.errors).toBeNull();
    expect(JSON.parse(JSON.stringify(emitted))).toHaveProperty("errors", null);
  });

  it("tells the row-cap refusal, the unknown-entity-type refusal and the forbidden refusal apart", () => {
    // THE assertion this file exists for. Lose the code and every one of these becomes "something
    // broke", and an admin correctly refused for lacking view access would be told to retry.
    const rowCap = ValueExportMapper.fromJsonToError(FAILURE);
    expect(rowCap.isRowCapRefusal).toBe(true);
    expect(rowCap.isUnknownEntityType).toBe(false);
    expect(rowCap.isForbidden).toBe(false);

    const unknownType = ValueExportMapper.fromJsonToError({
      statusCode: 422,
      errorCode: UNKNOWN_ENTITY_TYPE_ERROR_CODE,
      message: "'nope' is not a registered entity type",
      errors: null,
    });
    expect(unknownType.isRowCapRefusal).toBe(false);
    expect(unknownType.isUnknownEntityType).toBe(true);
    expect(unknownType.isForbidden).toBe(false);

    const forbidden = ValueExportMapper.fromJsonToError({
      statusCode: 403,
      errorCode: FORBIDDEN_ERROR_CODE,
      message: "You do not have permission to view party.person records.",
      errors: null,
    });
    expect(forbidden.isRowCapRefusal).toBe(false);
    expect(forbidden.isUnknownEntityType).toBe(false);
    expect(forbidden.isForbidden).toBe(true);

    const transport = ValueExportMapper.toError(
      ValueExportFailureModel.fromUnknown("Network Error")
    );
    // A request that never reached the server must never claim the server refused it any of the
    // three ways above.
    expect(transport.errorCode).toBe(UNKNOWN_ERROR_CODE);
    expect(transport.isRowCapRefusal).toBe(false);
    expect(transport.isUnknownEntityType).toBe(false);
    expect(transport.isForbidden).toBe(false);
    expect(transport.statusCode).toBe(0);
    expect(transport.message).toBe("Network Error");
  });

  it("is an Error, so it survives being thrown and caught by type", () => {
    const error = ValueExportMapper.fromJsonToError(FAILURE);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ValueExportError");
  });
});

describe("ValueExport entity behaviour", () => {
  it("accepts a workbook, with or without a charset suffix on the content type", () => {
    const plain = ValueExportMapper.fromJsonToEntity(FILE, bytes());
    const suffixed = ValueExportMapper.fromJsonToEntity(
      { ...FILE, contentType: `${XLSX_CONTENT_TYPE}; charset=utf-8` },
      bytes()
    );

    expect(plain.isUnexpectedContentType).toBe(false);
    expect(suffixed.isUnexpectedContentType).toBe(false);
    expect(plain.isUsable).toBe(true);
  });

  it("accepts a workbook whose content type a proxy stripped", () => {
    const stripped = ValueExportMapper.fromJsonToEntity({ ...FILE, contentType: "" }, bytes());

    expect(stripped.isUnexpectedContentType).toBe(false);
    expect(stripped.isUsable).toBe(true);
  });

  it("refuses a body that announces itself as something other than a workbook", () => {
    const html = ValueExportMapper.fromJsonToEntity({ ...FILE, contentType: "text/html" }, bytes());
    const json = ValueExportMapper.fromJsonToEntity(
      { ...FILE, contentType: "application/json" },
      bytes()
    );

    expect(html.isUnexpectedContentType).toBe(true);
    expect(html.isUsable).toBe(false);
    expect(json.isUsable).toBe(false);
  });

  it("refuses a zero-byte body", () => {
    const empty = ValueExportMapper.fromJsonToEntity({ ...FILE, byteSize: 0 }, bytes(0));

    expect(empty.isEmpty).toBe(true);
    expect(empty.isUsable).toBe(false);
  });

  it("formats the size for the result line", () => {
    const b = ValueExportMapper.fromJsonToEntity({ ...FILE, byteSize: 512 }, bytes());
    const kb = ValueExportMapper.fromJsonToEntity({ ...FILE, byteSize: 20_480 }, bytes());
    const mb = ValueExportMapper.fromJsonToEntity({ ...FILE, byteSize: 3_145_728 }, bytes());

    expect(b.formattedSize()).toBe("512 B");
    expect(kb.formattedSize()).toBe("20.0 KB");
    expect(mb.formattedSize()).toBe("3.0 MB");
  });
});

describe("the filename mirrors the handler's own rule", () => {
  const at = new Date(Date.UTC(2026, 7, 21, 10, 15, 0));

  it("stamps yyyyMMdd-HHmmss in UTC, zero-padded", () => {
    expect(formatExportStamp(at)).toBe("20260821-101500");
  });

  it("always includes the sanitised entity-type key -- there is no unscoped form", () => {
    expect(buildValueExportFileName("party.person", at)).toBe(
      "custom-field-values-party.person-20260821-101500.xlsx"
    );
  });

  it("DROPS characters the handler drops, rather than substituting them", () => {
    expect(sanitizeEntityTypeKey("party/person org")).toBe("partypersonorg");
    expect(sanitizeEntityTypeKey("a-b_c.d")).toBe("a-b_c.d");
  });
});

describe("ValueExportFileModel.fromResponse", () => {
  it("takes the size and content type from the bytes themselves, not from a header", () => {
    const blob = bytes(4096);
    const model = ValueExportFileModel.fromResponse(
      blob,
      "party.person",
      new Date(Date.UTC(2026, 7, 21, 10, 15, 0))
    );

    expect(model.byteSize).toBe(4096);
    expect(model.contentType).toBe(XLSX_CONTENT_TYPE);
    expect(model.entityTypeKey).toBe("party.person");
    expect(model.fileName).toBe("custom-field-values-party.person-20260821-101500.xlsx");
    expect(model.blob).toBe(blob);
  });
});
