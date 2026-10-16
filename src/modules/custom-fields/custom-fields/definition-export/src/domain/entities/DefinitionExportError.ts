/**
 * DefinitionExportError — the domain's view of a refused or failed export (Wave 6 row 6.4)
 *
 * WHY THIS EXISTS AT ALL, WHEN A PLAIN `Error` WOULD COMPILE
 * ---------------------------------------------------------
 * Because one of the failures this route returns is not a failure. Past `MaxExportRows` the handler
 * REFUSES the export rather than truncating it — deliberately, because a spreadsheet that silently
 * stops at row 10,000 reads as a complete answer to whoever opens it. That refusal arrives as a 422,
 * which is indistinguishable from "something broke" unless the client keeps the error CODE.
 *
 * An admin who hits the cap needs to know their export was refused and how to narrow it. Telling
 * them "couldn't export the definitions" would be a lie of omission about a working system, and
 * would send them looking for a fault that does not exist. So the code survives the trip from the
 * wire into the domain, and the view model branches on it.
 *
 * The flags are getters over `errorCode` rather than booleans set at construction, so there is
 * exactly one place that decides what each code means.
 */
import {
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
} from "../../data/models/DefinitionExportModel";

/**
 * Documentation for module export
 */
export class DefinitionExportError extends Error {
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
    this.name = "DefinitionExportError";
    this.statusCode = fields.statusCode;
    this.errorCode = fields.errorCode;
    this.details = fields.details;
    // Required for `instanceof` to survive the ES5 `extends Error` downlevel transform.
    Object.setPrototypeOf(this, DefinitionExportError.prototype);
  }

  /**
   * True when the export was REFUSED for exceeding the row cap.
   *
   * The one failure that must never render as a generic error. Nothing is broken, no retry will
   * help, and the remedy — narrow the scope to a single entity type — is something only the admin
   * can do.
   */
  get isRowCapRefusal(): boolean {
    return this.errorCode === ROW_CAP_ERROR_CODE;
  }

  /**
   * True when the requested `entityTypeKey` is not in the registry.
   *
   * Worth distinguishing because the server's own message names the rejected key, which is more
   * useful than anything this client could compose. Unreachable from the dialog's own picker, which
   * only offers registered types — but reachable the moment a caller passes a key from anywhere
   * else, and the handler validates rather than returning an empty workbook precisely so that a typo
   * does not read as "this entity type has no custom fields".
   */
  get isUnknownEntityType(): boolean {
    return this.errorCode === UNKNOWN_ENTITY_TYPE_ERROR_CODE;
  }
}
