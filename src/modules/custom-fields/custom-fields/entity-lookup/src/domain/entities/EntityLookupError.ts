/**
 * EntityLookupError — the one place that decides what a failed lookup MEANS (Wave 4)
 *
 * WHY A TAXONOMY AND NOT A PLAIN `Error`
 * --------------------------------------
 * Three of this feature's failures need three different sentences on screen, and the three fixes
 * belong to three different people:
 *
 *   403 — the CALLER lacks the target type's `view` permission. Nothing is wrong with the data.
 *         The remedy is a role change, and the field should stay non-editable rather than blank.
 *   404 — the RECORD does not resolve: deleted, soft-deleted, or another tenant's, merged into one
 *         answer on purpose so this endpoint cannot be used to probe for ids in a tenant the caller
 *         cannot see. The remedy is a data change.
 *   422 — the STORED ID is malformed or tampered with. The remedy is a re-pick.
 *
 * `EntityLookupController`'s own doc comment names the failure mode this file exists to prevent: one
 * grey dash for all of them is what leaves a dangling reference invisible for a year. Merging them
 * is not a cosmetic shortcut — it deletes the information that says whose problem it is.
 *
 * WHAT IT KEYS ON, AND WHY THAT AND NOT THE HTTP STATUS
 * ----------------------------------------------------
 * `IApiService` does not expose response status codes. What it does expose, on every rejection that
 * carried a structured body, is `error.details` — the parsed `ErrorResponse`, which carries BOTH
 * `statusCode` and `errorCode`. `errorCode` is checked first because it is machine-readable and
 * language-independent (the same reasoning `DefinitionExportError` in this module already relies
 * on), and `statusCode` is the fallback for codes this file has not enumerated. Nothing keys on the
 * message: it is localized server text, so a message match would work in English and stop working
 * in Arabic.
 *
 * WHICH 403s REACH THIS FILE, AND WHICH NEVER WILL
 * ------------------------------------------------
 * The `AUTH_FORBIDDEN` / status-403 arms below are live. `ApiService`'s 403 branch attaches the
 * parsed body as `details` on its business-rule case (a 403 carrying an `errorCode`), so a refusal
 * from `EntityLookupRegistry` — which returns `Error.Forbidden(ErrorCodes.Forbidden, ...)`, i.e.
 * `AUTH_FORBIDDEN`, and reaches the wire through `this.ErrorResult(result.Error)` — arrives here with
 * a classifiable body and lands in `forbidden`. That is the 403 this feature actually produces: the
 * caller's role lacks the TARGET entity type's `view` permission.
 *
 * The one 403 that cannot reach here is a failure of the ASP.NET authorization POLICY itself — the
 * controller's coarse `[Authorize]`/`[AdminOnly]` — which returns an empty body and therefore no
 * `errorCode`. `ApiService` treats that as "you have no business being on this page" and hard
 * redirects to `/not-authorized` before any classification happens. So it is not a state this
 * taxonomy has to name: by the time it would be classified, the page is already gone.
 *
 * Nothing here keys on the message, and nothing ever should: it is localized server text, so a
 * message match would appear to work and then silently stop when the UI language changes.
 */

/** ErrorResponse.errorCode for a permission failure on the target entity type. */
const FORBIDDEN_ERROR_CODE = "AUTH_FORBIDDEN";
/** ErrorResponse.errorCode when the referenced record does not resolve. */
const NOT_FOUND_ERROR_CODE = "ENTITY_NOT_FOUND";
/** ErrorResponse.errorCode when the entityTypeKey itself is not in the registry. */
const UNKNOWN_ENTITY_TYPE_ERROR_CODE = "ENTITY_UNKNOWN_TYPE";
/** ErrorResponse.errorCode when the encrypted id failed to decrypt. */
const INVALID_ID_ERROR_CODE = "ENTITY_INVALID_ID";
/** ErrorResponse.errorCode when a required route value arrived blank. */
const VALIDATION_REQUIRED_ERROR_CODE = "VALIDATION_REQUIRED";
/** ErrorResponse.errorCode when the owning module is registered but not composed into this host. */
const MODULE_UNAVAILABLE_ERROR_CODE = "SYSTEM_MODULE_DEPENDENCY_UNAVAILABLE";

/** Placeholder code for a failure that never carried an `ErrorResponse` body. */
const UNKNOWN_ERROR_CODE = "UNKNOWN";

/**
 * What a failed lookup means, at the granularity the UI must distinguish.
 *
 * `cancelled` is in the union so a request we aborted ourselves can never be reported as a server
 * failure. It is a real hazard rather than a theoretical one: `ApiService`'s interceptor runs every
 * abort — including an ordinary `AbortController.abort()` on a superseded search — through
 * `isExternalAbort`, which matches axios's `ERR_CANCELED` and rejects with `DownloadInterceptedError`.
 * So the debounce's own cancellations arrive looking like a download-manager event. Named here, they
 * are droppable; unnamed, they would have surfaced as "lookup failed" on every keystroke that
 * outran its request.
 *
 * `unavailable` covers "this deployment cannot answer for that type at all" — an unregistered key or
 * a module not composed into the host. Kept apart from `missing` deliberately: both arrive as a 404
 * from the resolve route, but one means a record was deleted and the other means the field is
 * pointed at a type this build does not have. Folding them together would be a smaller version of
 * the exact defect this file exists to prevent.
 */
export type EntityLookupFailureKind =
  | "forbidden"
  | "missing"
  | "invalid"
  | "unavailable"
  | "cancelled"
  | "unknown";

/** The `ErrorResponse` body shape `ApiService` attaches as `error.details`. */
interface ErrorResponseBody {
  statusCode?: number;
  errorCode?: string;
  message?: string;
}

/**
 * True for an object shaped like the API's `ErrorResponse`.
 *
 * Requires `errorCode` OR `statusCode` — either one is enough to classify, and demanding both would
 * reject a body from a handler that emitted only one of them, sending a perfectly classifiable
 * failure to `unknown`.
 */
function isErrorResponseBody(value: unknown): value is ErrorResponseBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as ErrorResponseBody;
  return typeof candidate.errorCode === "string" || typeof candidate.statusCode === "number";
}

/**
 * True when the rejection is our own cancellation rather than a server answer.
 *
 * Checks the shapes `ApiService` can produce for an abort: `DownloadInterceptedError` (by name, not
 * `instanceof`, so this does not import the transport's error class into the domain layer),
 * axios's `ERR_CANCELED`/`ECONNABORTED` codes, and the DOM `AbortError`.
 */
function isCancellation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { name?: string; code?: string | number };
  if (candidate.name === "DownloadInterceptedError" || candidate.name === "AbortError") return true;
  return candidate.code === "ERR_CANCELED" || candidate.code === "ECONNABORTED";
}

/** errorCode -> meaning. The primary table: language-independent and set by the handler that decided. */
const KIND_BY_ERROR_CODE: Record<string, EntityLookupFailureKind> = {
  [FORBIDDEN_ERROR_CODE]: "forbidden",
  [NOT_FOUND_ERROR_CODE]: "missing",
  [INVALID_ID_ERROR_CODE]: "invalid",
  [VALIDATION_REQUIRED_ERROR_CODE]: "invalid",
  [UNKNOWN_ENTITY_TYPE_ERROR_CODE]: "unavailable",
  [MODULE_UNAVAILABLE_ERROR_CODE]: "unavailable",
};

/**
 * HTTP status -> meaning. The fallback, for a code this file has not enumerated.
 *
 * 422 AND 400 both map to `invalid` because the wire status for a malformed id is 422, not 400:
 * `ErrorResponse.FromError` maps `ErrorType.Validation` to 422, even though the controller's
 * `[ProducesResponseType]` attribute advertises 400. 400 is kept in the table so a future handler
 * that returns a plain `BadRequest` classifies the same way.
 *
 * A bare 404 with no code stays `missing` rather than `unavailable`: without the code the two are
 * genuinely indistinguishable, and "the referenced record no longer exists" is the reading that
 * describes a real, actionable possibility.
 */
const KIND_BY_STATUS_CODE: Record<number, EntityLookupFailureKind> = {
  400: "invalid",
  403: "forbidden",
  404: "missing",
  422: "invalid",
};

/**
 * Documentation for module export
 */
export class EntityLookupError extends Error {
  /** `kind` is what callers branch on; everything else is here for logs and future specificity. */
  readonly kind: EntityLookupFailureKind;
  /** HTTP status from the `ErrorResponse` body; 0 when the failure carried no body. */
  readonly statusCode: number;
  /** `ErrorResponse.errorCode`, or `"UNKNOWN"` when the failure carried no body. */
  readonly errorCode: string;

  constructor(fields: {
    kind: EntityLookupFailureKind;
    statusCode: number;
    errorCode: string;
    message: string;
  }) {
    super(fields.message);
    this.name = "EntityLookupError";
    this.kind = fields.kind;
    this.statusCode = fields.statusCode;
    this.errorCode = fields.errorCode;
    // Required for `instanceof` to survive the ES5 `extends Error` downlevel transform.
    Object.setPrototypeOf(this, EntityLookupError.prototype);
  }

  /**
   * Classifies whatever the transport threw.
   *
   * Idempotent by design — an `EntityLookupError` passed back in is returned unchanged. The service
   * classifies at the boundary and the hooks call this again defensively, and neither should have to
   * know whether the other already did it.
   *
   * Order is deliberate: cancellation first (it is not a server answer at all and must never be
   * classified as one), then `errorCode`, then `statusCode`, then `unknown`. Nothing falls through
   * to a message match — see this file's header on why.
   */
  static from(error: unknown): EntityLookupError {
    if (error instanceof EntityLookupError) return error;

    const message = error instanceof Error ? error.message : String(error);

    if (isCancellation(error)) {
      return new EntityLookupError({
        kind: "cancelled",
        statusCode: 0,
        errorCode: UNKNOWN_ERROR_CODE,
        message,
      });
    }

    const details = (error as { details?: unknown } | null)?.details;
    if (isErrorResponseBody(details)) {
      const errorCode = details.errorCode ?? UNKNOWN_ERROR_CODE;
      const statusCode = details.statusCode ?? 0;
      const kind =
        KIND_BY_ERROR_CODE[errorCode] ?? KIND_BY_STATUS_CODE[statusCode] ?? "unknown";
      return new EntityLookupError({
        kind,
        statusCode,
        errorCode,
        // The server's own sentence, not ours: it names the missing permission or the rejected key,
        // which is more specific than anything this client could compose. The control still renders
        // its own localized text -- this message is for logs and for a developer reading a failure.
        message: details.message ?? message,
      });
    }

    return new EntityLookupError({
      kind: "unknown",
      statusCode: 0,
      errorCode: UNKNOWN_ERROR_CODE,
      message,
    });
  }
}
