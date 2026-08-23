/**
 * SchemaImportError — the domain's view of a refused or failed schema import (Wave 6 row 6.5's
 * import half)
 *
 * A WHOLE-CALL REFUSAL, DIFFERENT IN KIND FROM A PER-GROUP OUTCOME
 * ---------------------------------------------------------------------
 * `SchemaImportResult`'s per-group Skipped/Failed outcomes are a SUCCESSFUL response (HTTP 200):
 * the call was understood and each group was individually decided. This error is the OTHER
 * failure mode -- the handler's whole-bundle SHAPE validation refused the file before touching the
 * database at all, so nothing in it was imported. A hand-edited or corrupted JSON file is a real
 * input source for this one endpoint (unlike almost every other command in this module), which is
 * why that tier exists as a clean, single refusal rather than one Failed entry per group.
 *
 * ONLY ONE CODE IS WORTH ITS OWN FLAG HERE
 * -------------------------------------------
 * The handler's shape gate returns `VALIDATION_INVALID_FORMAT` for several different problems
 * (a malformed bundle, an unsupported format version, an invalid key, a duplicate group key) --
 * one code, several distinct sentences, and the code alone cannot tell them apart. Rather than
 * guess at the server's message with a regex, this error surfaces that whole family through the
 * server's own (already-localized) message. The one code that DOES mean one specific, nameable
 * thing is `VALIDATION_RANGE` -- the item-count ceiling, which carries a `{max}` this client
 * mirrors, the same way the export siblings' row-cap refusals do.
 */
import { TOO_MANY_ROWS_ERROR_CODE } from "../../data/models/SchemaImportModel";

export class SchemaImportError extends Error {
  /** HTTP status from the `ErrorResponse` body; 0 when the failure carried no body. */
  readonly statusCode: number;
  /** `ErrorResponse.errorCode` — machine-readable and language-independent. */
  readonly errorCode: string;
  /** `ErrorResponse.errors`, null for every failure this route currently produces. */
  readonly details: string[] | null;

  constructor(fields: {
    statusCode: number;
    errorCode: string;
    message: string;
    details: string[] | null;
  }) {
    super(fields.message);
    this.name = "SchemaImportError";
    this.statusCode = fields.statusCode;
    this.errorCode = fields.errorCode;
    this.details = fields.details;
    // Required for `instanceof` to survive the ES5 `extends Error` downlevel transform.
    Object.setPrototypeOf(this, SchemaImportError.prototype);
  }

  /**
   * True when the bundle was REFUSED for exceeding the handler's item-count ceiling (groups plus
   * definitions combined). Not a fault: the remedy is to split the file into smaller bundles
   * (e.g. by re-exporting one entity type at a time) and import each separately.
   */
  get isTooManyRows(): boolean {
    return this.errorCode === TOO_MANY_ROWS_ERROR_CODE;
  }
}
