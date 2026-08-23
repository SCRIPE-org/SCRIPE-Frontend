/**
 * ValueExportError — the domain's view of a refused or failed value export (Wave 6 row 6.4's
 * completion)
 *
 * THREE DISTINGUISHABLE OUTCOMES, NOT ONE GENERIC FAILURE
 * --------------------------------------------------------
 * `DefinitionExportError` carries a row-cap refusal and an unknown-entity-type refusal, because a
 * plain `Error` cannot tell either apart from a fault. This error carries a THIRD: a per-entity-type
 * VIEW-PERMISSION refusal, because unlike the definitions export (gated on the single admin
 * permission `custom-fields.export`, which is exactly what the export BUTTON already requires to
 * render), this route is gated on `{PermissionResource}.view` — a permission that varies by which
 * entity type the admin picked in the dialog. A caller who can view "party.person" records but not
 * "media.file" ones will hit this refusal choosing the second without it being a bug in anything.
 *
 *  1. **Row-cap REFUSAL** (`VALIDATION_RANGE`) — past the handler's cell-count ceiling
 *     (owners × visible fields) the export is refused rather than truncated, for the identical
 *     reason the definitions export refuses: a workbook that silently stops reads as a complete
 *     answer.
 *  2. **Unknown entity type** (`VALIDATION_INVALID_FORMAT`) — unreachable from this dialog's own
 *     picker, which only offers registered types, but reachable the moment a caller (or a future
 *     one) passes a key from anywhere else.
 *  3. **Forbidden** (`AUTH_FORBIDDEN`) — the caller lacks `{PermissionResource}.view` for the entity
 *     type they picked. Worth its own flag for the same reason the other two are: "couldn't export"
 *     would send an admin looking for a fault in a system that is correctly refusing them, when the
 *     real remedy is either picking a different entity type or asking for access to this one.
 *
 * The flags are getters over `errorCode` rather than booleans set at construction, so there is
 * exactly one place that decides what each code means — same shape as `DefinitionExportError`.
 */
import {
  FORBIDDEN_ERROR_CODE,
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
} from "../../data/models/ValueExportModel";

export class ValueExportError extends Error {
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
    this.name = "ValueExportError";
    this.statusCode = fields.statusCode;
    this.errorCode = fields.errorCode;
    this.details = fields.details;
    // Required for `instanceof` to survive the ES5 `extends Error` downlevel transform.
    Object.setPrototypeOf(this, ValueExportError.prototype);
  }

  /**
   * True when the export was REFUSED for exceeding the handler's cell-count ceiling.
   *
   * The ceiling bounds owners × visible fields, not the owner count alone — a values export can hit
   * it with far fewer owner records than the definitions export needs definitions, once a record
   * type carries many fields. The remedy this client can name either way is the same: narrow to a
   * scope with fewer cells, which for this endpoint means nothing (the entity type is already the
   * whole scope) — so the copy that renders this points at "fewer records or fields", not at a
   * second picker this dialog does not have.
   */
  get isRowCapRefusal(): boolean {
    return this.errorCode === ROW_CAP_ERROR_CODE;
  }

  /**
   * True when the requested `entityTypeKey` is not in the registry.
   *
   * Unreachable from this dialog's own picker, which only offers registered types — but reachable
   * the moment a caller passes a key from anywhere else, and the handler validates rather than
   * returning an empty workbook precisely so that a typo does not read as "this entity type has no
   * values".
   */
  get isUnknownEntityType(): boolean {
    return this.errorCode === UNKNOWN_ENTITY_TYPE_ERROR_CODE;
  }

  /**
   * True when the caller lacks `{PermissionResource}.view` for the entity type they picked.
   *
   * THE REFUSAL THIS ERROR EXISTS TO NAME. Nothing here is a fault: the handler is doing exactly
   * what it should for a caller who cannot read this entity type's records at all. The remedy is
   * either picking a different entity type or asking an administrator for view access to this one —
   * never "retry", which is what the generic failure copy would imply.
   */
  get isForbidden(): boolean {
    return this.errorCode === FORBIDDEN_ERROR_CODE;
  }
}
