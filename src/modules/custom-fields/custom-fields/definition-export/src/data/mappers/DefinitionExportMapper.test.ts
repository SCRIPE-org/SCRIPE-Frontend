/**
 * DefinitionExportMapper — the full round trip (Wave 6 row 6.4)
 *
 * TWO ROUND TRIPS, AND THE SECOND ONE IS THE DANGEROUS ONE
 * -------------------------------------------------------
 * The FILE direction carries the descriptor the dialog reports from — a dropped member there costs a
 * wrong name or a wrong size in one sentence.
 *
 * The ERROR direction carries `errorCode`, and dropping it is not cosmetic at all: without the code
 * the row-cap REFUSAL is indistinguishable from "something broke", so an admin whose export was
 * declined for size would be sent hunting a fault that does not exist while their real problem goes
 * unnamed. That is the defect this file exists to prevent.
 *
 * BOTH FIXTURES POPULATE EVERY NULLABLE WITH A NON-NULL VALUE. A null-heavy fixture is exactly how a
 * dropped field passes: the mapper omits it, the value reads back as `null`, and it matches a `null`
 * fixture perfectly while the real payload is truncated. That is not hypothetical in this module —
 * `CustomFieldMapper` shipped precisely that defect with `optionsAr`. Each fixture also asserts its
 * OWN completeness against the contract's key set, so adding a member without extending the fixture
 * fails here rather than silently going uncovered.
 */
import { describe, it, expect } from "vitest";
import { DefinitionExportMapper } from "./DefinitionExportMapper";
import {
  DefinitionExportFailureModel,
  DefinitionExportFileModel,
  MAX_EXPORT_ROWS,
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
  UNKNOWN_ERROR_CODE,
  XLSX_CONTENT_TYPE,
  buildDefinitionExportFileName,
  formatExportStamp,
  sanitizeEntityTypeKey,
  type DefinitionExportFailureJson,
  type DefinitionExportFileJson,
} from "../models/DefinitionExportModel";

/**
 * A descriptor with no null anywhere — `entityTypeKey` is the only nullable member and it carries a
 * real key, so a mapper that dropped it produces `null` and fails.
 */
const FILE: DefinitionExportFileJson = {
  entityTypeKey: "party.person",
  fileName: "custom-field-definitions-party.person-20260821-101500.xlsx",
  contentType: XLSX_CONTENT_TYPE,
  byteSize: 20_480,
};

/** An error body with no null anywhere — `errors` is the only nullable member and it carries rows. */
const FAILURE: DefinitionExportFailureJson = {
  statusCode: 422,
  errorCode: ROW_CAP_ERROR_CODE,
  message: `Too many definitions to export at once (limit ${MAX_EXPORT_ROWS}). Narrow the export by choosing a single entity type.`,
  errors: ["definitions: 10001", "limit: 10000"],
};

/** Stand-in for the workbook. The mapper must not touch the bytes, so what they are is irrelevant. */
function bytes(size = 20_480, type = XLSX_CONTENT_TYPE): Blob {
  return new Blob([new Uint8Array(size)], { type });
}

/** Every key of the object, so a fixture that forgets one is caught here and not by a reviewer. */
function keysOf(value: object): string[] {
  return Object.keys(value).sort();
}

describe("DefinitionExportMapper — the file round trip", () => {
  it("returns an identical descriptor after json -> entity -> model -> json", () => {
    const blob = bytes();
    const roundTripped = DefinitionExportMapper.toModel(
      DefinitionExportMapper.fromJsonToEntity(FILE, blob)
    ).toJson();

    expect(roundTripped).toEqual(FILE);
    // Not just deep-equal: key ORDER survives too, so a mapper that rebuilt the object with
    // re-sorted keys is caught rather than passing `toEqual`.
    expect(JSON.stringify(roundTripped)).toBe(JSON.stringify(FILE));
  });

  it("carries every descriptor field through, one assertion per field", () => {
    const entity = DefinitionExportMapper.fromJsonToEntity(FILE, bytes());

    expect(entity.entityTypeKey).toBe("party.person");
    expect(entity.fileName).toBe("custom-field-definitions-party.person-20260821-101500.xlsx");
    expect(entity.contentType).toBe(XLSX_CONTENT_TYPE);
    expect(entity.byteSize).toBe(20_480);
  });

  it("hands over the SAME blob instance, never a re-wrapped copy", () => {
    const blob = bytes();
    const entity = DefinitionExportMapper.fromJsonToEntity(FILE, blob);

    // Identity, not equality: re-wrapping a multi-megabyte workbook would double peak memory and
    // could only ever produce a slightly different set of the same bytes.
    expect(entity.blob).toBe(blob);
    expect(DefinitionExportMapper.toModel(entity).blob).toBe(blob);
  });

  it("maps the same key set the wire shape declares, in both directions", () => {
    const entity = DefinitionExportMapper.fromJsonToEntity(FILE, bytes());
    const emitted = DefinitionExportMapper.toModel(entity).toJson();

    expect(keysOf(emitted)).toEqual(keysOf(FILE));
    // The entity's own data object must not be a lossy subset either -- plus the blob, which has no
    // JSON representation and is why the descriptor exists at all.
    expect(keysOf(entity.data)).toEqual(keysOf({ ...FILE, blob: null }));
  });

  it("keeps the file fixture honest: no nullable field is left unexercised", () => {
    for (const [key, value] of Object.entries(FILE)) {
      expect(value, `file.${key}`).not.toBeNull();
      expect(value, `file.${key}`).not.toBeUndefined();
    }
  });

  it("normalises an omitted entityTypeKey to an explicit null", () => {
    const emitted = DefinitionExportMapper.toModel(
      DefinitionExportMapper.fromJsonToEntity(
        { ...FILE, entityTypeKey: undefined } as unknown as DefinitionExportFileJson,
        bytes()
      )
    ).toJson();

    expect(emitted.entityTypeKey).toBeNull();
    // Present as null, not dropped as undefined -- `JSON.stringify` omits undefined properties
    // entirely, which would silently shorten the descriptor.
    expect(JSON.parse(JSON.stringify(emitted))).toHaveProperty("entityTypeKey", null);
  });
});

describe("DefinitionExportMapper — the error round trip", () => {
  it("returns an identical error body after json -> model -> json", () => {
    const roundTripped = DefinitionExportFailureModel.fromJson(FAILURE).toJson();

    expect(roundTripped).toEqual(FAILURE);
    expect(JSON.stringify(roundTripped)).toBe(JSON.stringify(FAILURE));
  });

  it("carries every error field into the domain error, one assertion per field", () => {
    const error = DefinitionExportMapper.fromJsonToError(FAILURE);

    expect(error.statusCode).toBe(422);
    expect(error.errorCode).toBe(ROW_CAP_ERROR_CODE);
    expect(error.message).toBe(FAILURE.message);
    // The one nullable on this contract, populated in the fixture so a mapper that dropped it
    // produces `null` and fails instead of matching.
    expect(error.details).toEqual(["definitions: 10001", "limit: 10000"]);
  });

  it("keeps the failure fixture honest: no nullable field is left unexercised", () => {
    for (const [key, value] of Object.entries(FAILURE)) {
      expect(value, `failure.${key}`).not.toBeNull();
      expect(value, `failure.${key}`).not.toBeUndefined();
    }
  });

  it("normalises an omitted errors list to an explicit null", () => {
    const emitted = DefinitionExportFailureModel.fromJson({
      ...FAILURE,
      errors: undefined,
    } as unknown as DefinitionExportFailureJson).toJson();

    expect(emitted.errors).toBeNull();
    expect(JSON.parse(JSON.stringify(emitted))).toHaveProperty("errors", null);
  });

  it("recognises the row-cap refusal, and does not mistake anything else for it", () => {
    // The assertion this file exists for. Lose the code and this refusal becomes "something broke".
    expect(DefinitionExportMapper.fromJsonToError(FAILURE).isRowCapRefusal).toBe(true);

    const unknownType = DefinitionExportMapper.fromJsonToError({
      statusCode: 422,
      errorCode: UNKNOWN_ENTITY_TYPE_ERROR_CODE,
      message: "'nope' is not a registered entity type",
      errors: null,
    });
    // Same status, same route, entirely different remedy -- so the two must not collapse into one.
    expect(unknownType.isRowCapRefusal).toBe(false);
    expect(unknownType.isUnknownEntityType).toBe(true);

    const transport = DefinitionExportMapper.toError(
      DefinitionExportFailureModel.fromUnknown("Network Error")
    );
    // A request that never reached the server must never claim the server refused it.
    expect(transport.errorCode).toBe(UNKNOWN_ERROR_CODE);
    expect(transport.isRowCapRefusal).toBe(false);
    expect(transport.isUnknownEntityType).toBe(false);
    expect(transport.statusCode).toBe(0);
    expect(transport.message).toBe("Network Error");
  });

  it("is an Error, so it survives being thrown and caught by type", () => {
    const error = DefinitionExportMapper.fromJsonToError(FAILURE);

    // `Object.setPrototypeOf` in the constructor is what makes this true after the ES5 downlevel
    // transform; without it the repository's `instanceof` branch silently stops matching.
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("DefinitionExportError");
  });
});

describe("DefinitionExport entity behaviour", () => {
  it("reports the requested scope, not one parsed from the file", () => {
    const scoped = DefinitionExportMapper.fromJsonToEntity(FILE, bytes());
    const unscoped = DefinitionExportMapper.fromJsonToEntity(
      { ...FILE, entityTypeKey: null },
      bytes()
    );

    expect(scoped.isScoped).toBe(true);
    expect(unscoped.isScoped).toBe(false);
  });

  it("accepts a workbook, with or without a charset suffix on the content type", () => {
    const plain = DefinitionExportMapper.fromJsonToEntity(FILE, bytes());
    const suffixed = DefinitionExportMapper.fromJsonToEntity(
      { ...FILE, contentType: `${XLSX_CONTENT_TYPE}; charset=utf-8` },
      bytes()
    );

    expect(plain.isUnexpectedContentType).toBe(false);
    expect(suffixed.isUnexpectedContentType).toBe(false);
    expect(plain.isUsable).toBe(true);
  });

  it("accepts a workbook whose content type a proxy stripped", () => {
    const stripped = DefinitionExportMapper.fromJsonToEntity({ ...FILE, contentType: "" }, bytes());

    // An ABSENT type is not a wrong type. Refusing here would be a false alarm no admin could act
    // on, over a file that is probably fine.
    expect(stripped.isUnexpectedContentType).toBe(false);
    expect(stripped.isUsable).toBe(true);
  });

  it("refuses a body that announces itself as something other than a workbook", () => {
    const html = DefinitionExportMapper.fromJsonToEntity(
      { ...FILE, contentType: "text/html" },
      bytes()
    );
    const json = DefinitionExportMapper.fromJsonToEntity(
      { ...FILE, contentType: "application/json" },
      bytes()
    );

    // A sign-in page saved as `.xlsx` is a file a spreadsheet refuses to open with no explanation.
    expect(html.isUnexpectedContentType).toBe(true);
    expect(html.isUsable).toBe(false);
    expect(json.isUsable).toBe(false);
  });

  it("refuses a zero-byte body, which this route never legitimately produces", () => {
    const empty = DefinitionExportMapper.fromJsonToEntity({ ...FILE, byteSize: 0 }, bytes(0));

    // The handler writes a header row before anything else, so even an export with no definitions is
    // a valid workbook of several kilobytes. Zero bytes means something else answered.
    expect(empty.isEmpty).toBe(true);
    expect(empty.isUsable).toBe(false);
  });

  it("formats the size for the result line", () => {
    const b = DefinitionExportMapper.fromJsonToEntity({ ...FILE, byteSize: 512 }, bytes());
    const kb = DefinitionExportMapper.fromJsonToEntity({ ...FILE, byteSize: 20_480 }, bytes());
    const mb = DefinitionExportMapper.fromJsonToEntity({ ...FILE, byteSize: 3_145_728 }, bytes());

    expect(b.formattedSize()).toBe("512 B");
    expect(kb.formattedSize()).toBe("20.0 KB");
    expect(mb.formattedSize()).toBe("3.0 MB");
  });
});

describe("the filename mirrors the server's own rule", () => {
  // The server's name is unreadable -- `Content-Disposition` is not in CORS `WithExposedHeaders` and
  // `getBlob` discards headers anyway -- so this client rebuilds it. A mirror can drift, so the rule
  // is pinned here rather than left to a comment.
  const at = new Date(Date.UTC(2026, 7, 21, 10, 15, 0));

  it("stamps yyyyMMdd-HHmmss in UTC, zero-padded", () => {
    expect(formatExportStamp(at)).toBe("20260821-101500");
    // A local stamp would make two admins in different offices produce differently named exports of
    // the same data.
    expect(formatExportStamp(new Date(Date.UTC(2026, 0, 2, 3, 4, 5)))).toBe("20260102-030405");
  });

  it("omits the scope segment for an unscoped export", () => {
    expect(buildDefinitionExportFileName(null, at)).toBe(
      "custom-field-definitions-20260821-101500.xlsx"
    );
  });

  it("includes the sanitised entity-type key for a scoped export", () => {
    expect(buildDefinitionExportFileName("party.person", at)).toBe(
      "custom-field-definitions-party.person-20260821-101500.xlsx"
    );
  });

  it("DROPS characters the server drops, rather than substituting them", () => {
    // `Sanitize` keeps ASCII letters, digits, `-`, `_` and `.` and drops the rest. A client that
    // substituted `_` would produce a different name for the same key.
    // Both the slash AND the space vanish, leaving the remaining characters butted together -- which
    // is what `char.IsAsciiLetterOrDigit(c) || c is '-' or '_' or '.'` does, and is the behaviour to
    // mirror rather than improve on.
    expect(sanitizeEntityTypeKey("party/person org")).toBe("partypersonorg");
    expect(sanitizeEntityTypeKey("a-b_c.d")).toBe("a-b_c.d");
    expect(buildDefinitionExportFileName("../etc/passwd", at)).toBe(
      "custom-field-definitions-..etcpasswd-20260821-101500.xlsx"
    );
  });

  it("falls back to the unscoped name when sanitising leaves nothing", () => {
    // Better than `custom-field-definitions--20260821-101500.xlsx`, which reads as a bug.
    expect(buildDefinitionExportFileName("!!!", at)).toBe(
      "custom-field-definitions-20260821-101500.xlsx"
    );
  });
});

describe("DefinitionExportFileModel.fromResponse", () => {
  it("takes the size and content type from the bytes themselves, not from a header", () => {
    const blob = bytes(4096);
    const model = DefinitionExportFileModel.fromResponse(
      blob,
      "party.person",
      new Date(Date.UTC(2026, 7, 21, 10, 15, 0))
    );

    // The size reported to the admin is the size of the bytes that were really written.
    expect(model.byteSize).toBe(4096);
    expect(model.contentType).toBe(XLSX_CONTENT_TYPE);
    expect(model.entityTypeKey).toBe("party.person");
    expect(model.fileName).toBe("custom-field-definitions-party.person-20260821-101500.xlsx");
    expect(model.blob).toBe(blob);
  });
});
