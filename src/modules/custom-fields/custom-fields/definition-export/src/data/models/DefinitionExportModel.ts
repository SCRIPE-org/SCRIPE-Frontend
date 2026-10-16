/**
 * Definition Export Models (DTOs)
 *
 * Wire shapes for `GET /v1/custom-fields/export` (Wave 6 row 6.4). The service speaks these; the
 * mapper converts to the `DefinitionExport` entity and the `DefinitionExportError` domain error.
 *
 * THIS ROUTE HAS TWO WIRE SHAPES, AND ONLY ONE OF THEM IS JSON
 * -----------------------------------------------------------
 * The sibling schema export returns `Ok(bundle)` — one JSON body, one model. This one returns
 * `File(bytes, contentType, fileName)`, so:
 *
 *  - **Success is an `.xlsx` byte stream.** There is no JSON to parse, no field list to mirror, and
 *    the eighteen workbook columns are the SERVER's business — this client never opens the file. So
 *    `DefinitionExportFileModel` models the payload's DESCRIPTOR (what was asked for, what came
 *    back, how big it is) and carries the bytes beside it, untouched.
 *  - **Failure IS a JSON body** — `Core.Application.Common.ErrorResponse` — and it is the half that
 *    matters most here, because the row-cap REFUSAL lives in it. That shape is mirrored one-for-one
 *    by `DefinitionExportFailureModel`.
 *
 * `fromJson`/`toJson` therefore exist over the descriptor and over the failure body, which are the
 * two JSON-shaped things this endpoint actually produces. They are not decoration: the mapper's
 * round trip is what a test can pin, and a dropped member is how a refusal turns back into a
 * generic failure.
 *
 * WHY THE FILENAME IS BUILT HERE INSTEAD OF READ FROM THE RESPONSE
 * ---------------------------------------------------------------
 * The server supplies a filename in `Content-Disposition`, and the browser will not let us read it.
 * Two independent reasons, both outside this feature's reach:
 *
 *  1. **CORS.** `CorsConfiguration.cs` exposes `X-CSRF-Token` and `X-SignalR-User-Agent` and nothing
 *     else, so `Content-Disposition` is not a readable response header for this cross-origin SPA in
 *     either the Development or the Production policy. `useExportReport`'s own
 *     `content-disposition` parser in `@core/hooks` is dead code for the same reason.
 *  2. **The transport.** `IApiService.getBlob` resolves to a bare `Blob`; response headers are
 *     discarded inside `ApiService` and there is no overload that returns them. Widening that
 *     interface is a core change, not a submodule one.
 *
 * So `buildDefinitionExportFileName` MIRRORS the handler's own naming rule instead — same prefix,
 * same optional sanitised entity-type segment, same UTC `yyyyMMdd-HHmmss` stamp, same extension. It
 * is a mirror, which means it is a thing that can drift: the two follow-ups that would make the
 * server's own name readable are naming `Content-Disposition` in `WithExposedHeaders` and giving
 * `getBlob` a headers-carrying variant. Until then the stamp is taken when the REQUEST is issued,
 * so it differs from the server's by the request latency and by nothing else.
 */

export { XLSX_CONTENT_TYPE, MAX_EXPORT_ROWS } from "../../domain/entities/DefinitionExport";

/**
 * `ErrorCodes.Range` — the code the handler returns when the export is REFUSED for exceeding
 * `MaxExportRows`.
 *
 * Machine-readable and language-independent, which is the whole reason to branch on it: the refusal
 * has to read as a refusal in Arabic too, and it must stay distinguishable from the OTHER 422 this
 * route can return.
 */
export const ROW_CAP_ERROR_CODE = "VALIDATION_RANGE";

/**
 * `ErrorCodes.InvalidFormat` — the code for an `entityTypeKey` the registry does not know.
 *
 * A different 422 with a different remedy: the server's own message names the rejected key, so that
 * one is worth surfacing verbatim, where the row cap is worth restating in our own words.
 */
export const UNKNOWN_ENTITY_TYPE_ERROR_CODE = "VALIDATION_INVALID_FORMAT";

/** The code used when a failure carries no `ErrorResponse` body at all — see `fromUnknown`. */
export const UNKNOWN_ERROR_CODE = "UNKNOWN";

/**
 * The descriptor half of a successful export: everything about the payload that is not the payload.
 *
 * `entityTypeKey` is the scope that was REQUESTED, echoed back from the client's own call rather
 * than read off the response — a file body has nowhere to put it. Null means the unscoped export.
 */
export interface DefinitionExportFileJson {
  entityTypeKey: string | null;
  fileName: string;
  contentType: string;
  byteSize: number;
}

/**
 * `ErrorResponse` — the JSON body every failed call to this route returns.
 *
 * Mirrors `Core.Application.Common.ErrorResponse` one-for-one: `statusCode`, `errorCode`, `message`,
 * `errors`. `errors` is `IEnumerable<string>?` on the server and is null for both of this route's
 * validation failures, but it is part of the contract and is mapped rather than ignored.
 */
export interface DefinitionExportFailureJson {
  statusCode: number;
  errorCode: string;
  message: string;
  errors: string[] | null;
}

/**
 * Zero-pads a number for the filename stamp.
 */
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
 * else rather than replacing it.
 *
 * Dropping, not substituting, because that is what the server does; a client that substituted `_`
 * would produce a different name for the same key the moment the header becomes readable.
 */
export function sanitizeEntityTypeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9\-_.]/g, "");
}

/**
 * Builds the download filename, mirroring the handler's rule. See this file's header for why the
 * server's own `Content-Disposition` name cannot be read.
 *
 * @param entityTypeKey - The requested scope, or null for the unscoped export.
 * @param at - The moment the request was issued.
 */
export function buildDefinitionExportFileName(entityTypeKey: string | null, at: Date): string {
  const stamp = formatExportStamp(at);
  const scope = entityTypeKey ? sanitizeEntityTypeKey(entityTypeKey) : "";
  return scope.length > 0
    ? `custom-field-definitions-${scope}-${stamp}.xlsx`
    : `custom-field-definitions-${stamp}.xlsx`;
}

/**
 * A successful export: the descriptor plus the bytes.
 */
export class DefinitionExportFileModel {
  readonly entityTypeKey: string | null;
  readonly fileName: string;
  readonly contentType: string;
  readonly byteSize: number;
  /**
   * The workbook itself.
   *
   * Held OUTSIDE the JSON descriptor and never serialised. It is the one member `toJson` cannot
   * describe, which is precisely why the descriptor exists: a round-trip test can prove no
   * descriptor field was dropped without needing to compare megabytes of ZIP.
   */
  readonly blob: Blob;

  constructor(fields: DefinitionExportFileJson & { blob: Blob }) {
    this.entityTypeKey = fields.entityTypeKey ?? null;
    this.fileName = fields.fileName;
    this.contentType = fields.contentType;
    this.byteSize = fields.byteSize;
    this.blob = fields.blob;
  }

  /**
   * Rebuilds a model from a descriptor and the bytes that belong to it.
   *
   * Two arguments rather than the usual one, because the payload is not JSON: the descriptor is the
   * only JSON-shaped part of this endpoint's success path, and the bytes travel beside it.
   */
  static fromJson(json: DefinitionExportFileJson, blob: Blob): DefinitionExportFileModel {
    return new DefinitionExportFileModel({ ...json, blob });
  }

  /**
   * Builds a model from what the transport actually hands back.
   *
   * `byteSize` is taken from the blob rather than from a header, so the size reported to the admin is
   * the size of the bytes that were really written. `contentType` likewise comes from the blob,
   * which carries the response's own `Content-Type` — the one response header a `Blob` preserves.
   *
   * @param blob - The response body.
   * @param entityTypeKey - The requested scope, or null for the unscoped export.
   * @param requestedAt - When the request was issued; stamps the filename.
   */
  static fromResponse(
    blob: Blob,
    entityTypeKey: string | null,
    requestedAt: Date
  ): DefinitionExportFileModel {
    return new DefinitionExportFileModel({
      entityTypeKey,
      fileName: buildDefinitionExportFileName(entityTypeKey, requestedAt),
      contentType: blob.type,
      byteSize: blob.size,
      blob,
    });
  }

  /** The descriptor, in `DefinitionExportFileJson`'s declaration order. */
  toJson(): DefinitionExportFileJson {
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
export class DefinitionExportFailureModel {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly message: string;
  readonly errors: string[] | null;

  constructor(fields: DefinitionExportFailureJson) {
    this.statusCode = fields.statusCode;
    this.errorCode = fields.errorCode;
    this.message = fields.message;
    // `?? null` normalises an OMITTED key to an explicit null. The server writes `errors: null` for
    // both of this route's validation failures, but a source-generated context would skip it, and a
    // mapper that saw `undefined` where it expected `null` would carry the difference outward.
    this.errors = fields.errors ?? null;
  }

  /** Create a failure model from the API's JSON error body. */
  static fromJson(json: DefinitionExportFailureJson): DefinitionExportFailureModel {
    return new DefinitionExportFailureModel(json);
  }

  /**
   * Best-effort model for a failure that carried no `ErrorResponse` body.
   *
   * Reached when the request never got a structured answer — offline, a 401 the interceptor turned
   * into a bare `Error`, a proxy's HTML 502. The code is deliberately NOT one of the real ones, so
   * `isRowCapRefusal` cannot fire on a transport failure and tell an admin their export was refused
   * for size when in fact nothing reached the server.
   */
  static fromUnknown(message: string, statusCode = 0): DefinitionExportFailureModel {
    return new DefinitionExportFailureModel({
      statusCode,
      errorCode: UNKNOWN_ERROR_CODE,
      message,
      errors: null,
    });
  }

  /** Convert back to the API JSON shape, in `ErrorResponse`'s declaration order. */
  toJson(): DefinitionExportFailureJson {
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
 * domain error without re-parsing anything.
 *
 * A model-layer error on purpose: the service speaks Models, so what it throws must too. The
 * repository is the boundary that turns it into a `DefinitionExportError`.
 */
export class DefinitionExportFailure extends Error {
  constructor(readonly failure: DefinitionExportFailureModel) {
    super(failure.message);
    this.name = "DefinitionExportFailure";
    // Required for `instanceof` to survive the ES5 `extends Error` downlevel transform, which
    // otherwise leaves the prototype pointing at `Error`. Same guard `DownloadInterceptedError`
    // applies in core.
    Object.setPrototypeOf(this, DefinitionExportFailure.prototype);
  }
}
