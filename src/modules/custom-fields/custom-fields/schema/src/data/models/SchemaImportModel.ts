/**
 * Schema Import Models (DTOs)
 *
 * Wire shapes for `POST /v1/custom-fields/schema/import` (Wave 6 row 6.5's import half). The
 * service speaks these; the mapper converts the RESULT half to the `SchemaImportResult` entity and
 * the `SchemaImportError` domain error.
 *
 * THE REQUEST BODY IS DELIBERATELY NOT `SchemaBundleJson`
 * -------------------------------------------------------------
 * `SchemaBundleJson` (the export side's own type, in `SchemaBundleModel.ts`) is a fixed, versioned
 * shape this module controls and keeps in sync with the backend's `SchemaDefinition` DTO -- it is
 * NOT missing anything today. But typing the import payload as `SchemaBundleJson` would still be
 * wrong for what this route actually accepts: a picked FILE, which may have been exported by an
 * older or newer build of this same client, or hand-edited. Round-tripping it through
 * `SchemaBundleModel.fromJson`/`SchemaBundleMapper` would silently drop any field this build's
 * `SchemaBundleJson` does not yet know about -- exactly the failure mode a future additive,
 * un-versioned field on the backend DTO would hit, on the one path whose entire job is to put a
 * schema back exactly as it was exported.
 *
 * So the payload this module posts is typed as `SchemaImportBundlePayload` -- a loose, honest shape
 * that carries through whatever the picked file actually contained, property for property, with no
 * mapper rebuilding it in between. `looksLikeSchemaBundlePayload` is the one and only check this
 * client performs on it; everything else (format version, natural-key grammar, per-group business
 * rules) is the server's to enforce, and it already does -- see `SchemaImportError`'s own header.
 *
 * THE RESPONSE IS PLAIN JSON, NOT A FILE
 * -------------------------------------------
 * Unlike every export in this module, this route returns `Ok(ImportSchemaBundleResult)` -- a normal
 * JSON body over `api.post`, not a `FileContentResult` over `api.getBlob`. So unlike
 * `DefinitionExportService`/`ValueExportService`, there is no blob-typed error body to read back:
 * `ApiService`'s interceptor already parses a JSON failure body into `error.details` as a plain
 * object for a non-blob request.
 */

/** `ImportedGroupOutcome` on the wire — the C# enum's own member names (global `JsonStringEnumConverter`). */
export type ImportedGroupOutcomeJson = "Created" | "Skipped" | "Failed";

/** `ImportedGroupResult` on the wire. */
export interface ImportedGroupResultJson {
  entityTypeKey: string;
  stableKey: string;
  outcome: ImportedGroupOutcomeJson;
  reason: string | null;
  fieldsCreated: number;
}

/**
 * `ImportSchemaBundleResult` on the wire.
 *
 * The record's own `CreatedCount`/`SkippedCount`/`FailedCount` computed properties are NOT mirrored
 * here: they are pure functions of `Groups` (identical to how `SchemaImportResult`'s own getters are
 * computed client-side), so carrying a second, server-computed copy would only create a place for
 * the two to silently disagree with nothing this client could do about it.
 */
export interface ImportSchemaBundleResponseJson {
  groups: ImportedGroupResultJson[];
}

/**
 * `ErrorResponse` — the JSON body a REFUSED import call returns. Identical shape to every other
 * export/import failure body in this module.
 */
export interface ImportSchemaBundleFailureJson {
  statusCode: number;
  errorCode: string;
  message: string;
  errors: string[] | null;
}

/**
 * `ImportSchemaBundleCommandHandler.MaxItems` — the combined groups-plus-definitions ceiling.
 * Mirrored only so the refusal message can name the cap; this client never enforces it.
 */
export const MAX_IMPORT_ITEMS = 10_000;

/** `ErrorCodes.Range` — returned when the bundle is REFUSED for exceeding `MaxItems`. */
export const TOO_MANY_ROWS_ERROR_CODE = "VALIDATION_RANGE";

/** The code used when a failure carried no `ErrorResponse` body at all — see `fromUnknown`. */
export const UNKNOWN_ERROR_CODE = "UNKNOWN";

/**
 * The exact JSON forwarded as the request body — see this file's header for why it is not
 * `SchemaBundleJson`.
 */
export type SchemaImportBundlePayload = Record<string, unknown>;

/**
 * True for a value shaped enough like a schema bundle to be worth POSTing at all.
 *
 * DELIBERATELY MINIMAL. This is not a validator: it exists only to catch "picked an unrelated JSON
 * file" locally, with no network round trip, and give a friendly message instead of a raw 422 whose
 * text was written for a hand-edited EXPORT file, not for whatever else someone might have chosen in
 * a file picker. Every real structural rule (format version, natural-key grammar, label lengths,
 * duplicate keys) is the server's `ValidateShape` to enforce, and it already does -- duplicating any
 * of it here would be a second copy of that logic that can drift from the one that actually decides.
 */
export function looksLikeSchemaBundlePayload(
  value: unknown
): value is SchemaImportBundlePayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.formatVersion === "number" &&
    Array.isArray(candidate.groups) &&
    Array.isArray(candidate.definitions)
  );
}

/** One group outcome, with `fromJson`. Read-only response data, so there is no `toJson`. */
export class ImportedGroupResultModel {
  readonly entityTypeKey: string;
  readonly stableKey: string;
  readonly outcome: ImportedGroupOutcomeJson;
  readonly reason: string | null;
  readonly fieldsCreated: number;

  constructor(fields: ImportedGroupResultJson) {
    this.entityTypeKey = fields.entityTypeKey;
    this.stableKey = fields.stableKey;
    this.outcome = fields.outcome;
    this.reason = fields.reason ?? null;
    this.fieldsCreated = fields.fieldsCreated;
  }

  static fromJson(json: ImportedGroupResultJson): ImportedGroupResultModel {
    return new ImportedGroupResultModel(json);
  }
}

/**
 * The full import response.
 */
export class ImportSchemaBundleResultModel {
  readonly groups: ImportedGroupResultModel[];

  constructor(fields: { groups: ImportedGroupResultModel[] }) {
    this.groups = fields.groups;
  }

  /** `?? []` guards a response that (legally) names zero groups -- an empty bundle imports clean. */
  static fromJson(json: ImportSchemaBundleResponseJson): ImportSchemaBundleResultModel {
    return new ImportSchemaBundleResultModel({
      groups: (json.groups ?? []).map((group) => ImportedGroupResultModel.fromJson(group)),
    });
  }
}

/**
 * A refused import, as `ErrorResponse` describes it.
 */
export class ImportSchemaBundleFailureModel {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly message: string;
  readonly errors: string[] | null;

  constructor(fields: ImportSchemaBundleFailureJson) {
    this.statusCode = fields.statusCode;
    this.errorCode = fields.errorCode;
    this.message = fields.message;
    this.errors = fields.errors ?? null;
  }

  static fromJson(json: ImportSchemaBundleFailureJson): ImportSchemaBundleFailureModel {
    return new ImportSchemaBundleFailureModel(json);
  }

  /**
   * Best-effort model for a failure that carried no `ErrorResponse` body -- offline, a 401/403 the
   * interceptor rewrote, a proxy's HTML. `UNKNOWN_ERROR_CODE` so `isTooManyRows` cannot fire on a
   * request that never reached the server.
   */
  static fromUnknown(message: string, statusCode = 0): ImportSchemaBundleFailureModel {
    return new ImportSchemaBundleFailureModel({
      statusCode,
      errorCode: UNKNOWN_ERROR_CODE,
      message,
      errors: null,
    });
  }
}

/**
 * What the service throws. Carries the parsed failure model so the repository can map it to the
 * domain error without re-parsing anything.
 */
export class ImportSchemaBundleFailure extends Error {
  constructor(readonly failure: ImportSchemaBundleFailureModel) {
    super(failure.message);
    this.name = "ImportSchemaBundleFailure";
    Object.setPrototypeOf(this, ImportSchemaBundleFailure.prototype);
  }
}
