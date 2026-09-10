/**
 * Value Export Models (DTOs)
 *
 * Wire shapes for `GET /v1/custom-fields/values/{entityTypeKey}/export` (Wave 6 row 6.4's
 * completion). The service speaks these; the mapper converts to the `ValueExport` entity and the
 * `ValueExportError` domain error.
 *
 * SAME TWO-WIRE-SHAPES SPLIT AS THE DEFINITIONS EXPORT
 * ------------------------------------------------------
 * Success is an `.xlsx` byte stream — no JSON to parse, no column list to mirror, the ten workbook
 * columns are the SERVER's business. `ValueExportFileModel` models the payload's DESCRIPTOR and
 * carries the bytes beside it, untouched. Failure IS a JSON body (`ErrorResponse`), mirrored by
 * `ValueExportFailureModel`.
 *
 * WHY THIS FILE DUPLICATES RATHER THAN IMPORTS `DefinitionExportModel`'s HELPERS
 * --------------------------------------------------------------------------------
 * `formatExportStamp`/`sanitizeEntityTypeKey` are near-identical in shape to the definitions
 * export's own copies, and duplicated rather than shared on purpose: each export submodule mirrors
 * its OWN handler's naming rule (`ExportCustomFieldValuesQueryHandler.Sanitize` here,
 * `ExportCustomFieldDefinitionsQueryHandler.Sanitize` there) — they happen to agree today because
 * both handlers copied the same guard, not because one client rule serves both routes. The
 * definitions submodule does not export these helpers through its public `index.ts` either, so
 * reaching for them would mean a deep cross-submodule import into another feature's data layer, not
 * a shared utility.
 *
 * WHY THE FILENAME IS BUILT HERE INSTEAD OF READ FROM THE RESPONSE
 * --------------------------------------------------------------------
 * Same CORS and transport limits as the definitions export — see `DefinitionExportModel`'s header for
 * the full reasoning. `Content-Disposition` is not readable cross-origin and `getBlob` discards
 * response headers, so this mirrors the handler's own naming rule instead of reading it.
 */

export {
  XLSX_CONTENT_TYPE,
  MAX_EXPORT_ROWS,
} from "../../domain/entities/ValueExport";

/** `ErrorCodes.Range` — returned when the export is REFUSED for exceeding `MaxExportRows`. */
export const ROW_CAP_ERROR_CODE = "VALIDATION_RANGE";

/** `ErrorCodes.InvalidFormat` — returned when the requested `entityTypeKey` is not registered. */
export const UNKNOWN_ENTITY_TYPE_ERROR_CODE = "VALIDATION_INVALID_FORMAT";

/**
 * `ErrorCodes.Forbidden` — returned when the caller lacks `{PermissionResource}.view` for the
 * requested entity type.
 *
 * Not a code the sibling definitions/schema exports need: those are gated on the single static
 * `custom-fields.export` permission the export BUTTON already requires to render, so a caller who
 * can even see the button can never be refused this way. This route's permission varies by which
 * entity type the caller picks, so the refusal is real and reachable from the dialog.
 */
export const FORBIDDEN_ERROR_CODE = "AUTH_FORBIDDEN";

/** The code used when a failure carries no `ErrorResponse` body at all — see `fromUnknown`. */
export const UNKNOWN_ERROR_CODE = "UNKNOWN";

/**
 * The descriptor half of a successful export: everything about the payload that is not the payload.
 *
 * `entityTypeKey` is the scope that was REQUESTED, echoed back from the client's own call rather
 * than read off the response — a file body has nowhere to put it. Always present: unlike the
 * definitions export there is no unscoped call to make.
 */
export interface ValueExportFileJson {
  entityTypeKey: string;
  fileName: string;
  contentType: string;
  byteSize: number;
}

/**
 * `ErrorResponse` — the JSON body every failed call to this route returns. Mirrors
 * `Core.Application.Common.ErrorResponse` one-for-one, identical shape to
 * `DefinitionExportFailureJson`.
 */
export interface ValueExportFailureJson {
  statusCode: number;
  errorCode: string;
  message: string;
  errors: string[] | null;
}

/** Zero-pads a number for the filename stamp. */
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * The handler's `DateTime.UtcNow:yyyyMMdd-HHmmss`, in UTC.
 *
 * UTC and not local time, deliberately: the server stamps UTC, and a local stamp would make two
 * admins in different offices produce differently named exports of the same data.
 */
export function formatExportStamp(at: Date): string {
  return (
    `${at.getUTCFullYear()}${pad(at.getUTCMonth() + 1)}${pad(at.getUTCDate())}` +
    `-${pad(at.getUTCHours())}${pad(at.getUTCMinutes())}${pad(at.getUTCSeconds())}`
  );
}

/**
 * The handler's `Sanitize` — keeps ASCII letters, digits, `-`, `_` and `.`, and DROPS everything
 * else rather than replacing it. Identical rule to the definitions export's own copy; see this
 * file's header for why it is a separate copy rather than a shared import.
 */
export function sanitizeEntityTypeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9\-_.]/g, "");
}

/**
 * Builds the download filename, mirroring the handler's rule.
 *
 * Unlike `buildDefinitionExportFileName`, there is no "omit the scope segment" branch and no
 * "sanitising leaves nothing" fallback: `entityTypeKey` is mandatory here and always comes from a
 * REGISTERED entity type offered by the dialog's own picker, so it always carries at least one ASCII
 * letter or digit. The handler itself has no such fallback either — see this file's header.
 *
 * @param entityTypeKey - The requested (and only) scope.
 * @param at - The moment the request was issued.
 */
export function buildValueExportFileName(entityTypeKey: string, at: Date): string {
  return `custom-field-values-${sanitizeEntityTypeKey(entityTypeKey)}-${formatExportStamp(at)}.xlsx`;
}

/**
 * A successful export: the descriptor plus the bytes.
 */
export class ValueExportFileModel {
  readonly entityTypeKey: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly byteSize: number;
  /**
   * The workbook itself, held OUTSIDE the JSON descriptor and never serialised — same reasoning as
   * `DefinitionExportFileModel.blob`: an `.xlsx` is a ZIP container, and this client never opens it.
   */
  readonly blob: Blob;

  constructor(fields: ValueExportFileJson & { blob: Blob }) {
    this.entityTypeKey = fields.entityTypeKey;
    this.fileName = fields.fileName;
    this.contentType = fields.contentType;
    this.byteSize = fields.byteSize;
    this.blob = fields.blob;
  }

  /** Create a model from a descriptor and the bytes that belong to it. */
  static fromJson(json: ValueExportFileJson, blob: Blob): ValueExportFileModel {
    return new ValueExportFileModel({ ...json, blob });
  }

  /**
   * Builds a model from what the transport actually hands back.
   *
   * `byteSize` and `contentType` are taken from the blob itself, not from a header, so what is
   * reported to the admin is the size and type of the bytes that were really written.
   *
   * @param blob - The response body.
   * @param entityTypeKey - The requested (and only) scope.
   * @param requestedAt - When the request was issued; stamps the filename.
   */
  static fromResponse(
    blob: Blob,
    entityTypeKey: string,
    requestedAt: Date
  ): ValueExportFileModel {
    return new ValueExportFileModel({
      entityTypeKey,
      fileName: buildValueExportFileName(entityTypeKey, requestedAt),
      contentType: blob.type,
      byteSize: blob.size,
      blob,
    });
  }

  /** The descriptor, in `ValueExportFileJson`'s declaration order. */
  toJson(): ValueExportFileJson {
    return {
      entityTypeKey: this.entityTypeKey,
      fileName: this.fileName,
      contentType: this.contentType,
      byteSize: this.byteSize,
    };
  }
}

/**
 * A failed export, as `ErrorResponse` describes it.
 */
export class ValueExportFailureModel {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly message: string;
  readonly errors: string[] | null;

  constructor(fields: ValueExportFailureJson) {
    this.statusCode = fields.statusCode;
    this.errorCode = fields.errorCode;
    this.message = fields.message;
    // `?? null` normalises an OMITTED key to an explicit null -- same guard `DefinitionExportFailureModel`
    // applies, and for the identical reason: a source-generated context would skip a null member
    // rather than write it, and a mapper that saw `undefined` where it expected `null` would carry
    // the difference outward.
    this.errors = fields.errors ?? null;
  }

  /** Create a failure model from the API's JSON error body. */
  static fromJson(json: ValueExportFailureJson): ValueExportFailureModel {
    return new ValueExportFailureModel(json);
  }

  /**
   * Best-effort model for a failure that carried no `ErrorResponse` body.
   *
   * Reached when the request never got a structured answer — offline, a 401 the interceptor turned
   * into a bare `Error`, a proxy's HTML 502. The code is deliberately NOT one of the real ones, so
   * neither `isRowCapRefusal`, `isUnknownEntityType` nor `isForbidden` can fire on a transport
   * failure and misreport what actually happened.
   */
  static fromUnknown(message: string, statusCode = 0): ValueExportFailureModel {
    return new ValueExportFailureModel({
      statusCode,
      errorCode: UNKNOWN_ERROR_CODE,
      message,
      errors: null,
    });
  }

  /** Convert back to the API JSON shape, in `ErrorResponse`'s declaration order. */
  toJson(): ValueExportFailureJson {
    return {
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      message: this.message,
      errors: this.errors,
    };
  }
}

/**
 * What the service throws. Carries the parsed failure model so the repository can map it to the
 * domain error without re-parsing anything. A model-layer error on purpose, same reasoning as
 * `DefinitionExportFailure`.
 */
export class ValueExportFailure extends Error {
  constructor(readonly failure: ValueExportFailureModel) {
    super(failure.message);
    this.name = "ValueExportFailure";
    // Required for `instanceof` to survive the ES5 `extends Error` downlevel transform.
    Object.setPrototypeOf(this, ValueExportFailure.prototype);
  }
}
