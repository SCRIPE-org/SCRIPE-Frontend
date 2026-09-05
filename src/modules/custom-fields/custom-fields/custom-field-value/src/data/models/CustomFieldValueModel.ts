/**
 * CustomFieldValueType wire names -- mirrors backend enum member names verbatim
 * (CustomFields.Domain.Enums.CustomFieldValueType). The API's global
 * JsonStringEnumConverter serializes enums as strings, so this is never a
 * number on the wire. Wave 3.1 Task 10 added LongText/DateTime/MultiSelect --
 * the backend enum's members 5/6/7 (see that file's own doc comment for why
 * Date=3 keeps its existing member rather than being renumbered). Wave 3.2
 * Batch 3 adds Email/Url/Phone/Percent/Rating -- members 8/9/10/11/12,
 * verified against the real backend enum (Email=8, Url=9, Phone=10,
 * Percent=11, Rating=12) rather than assumed from the pre-plan analysis.
 * Wave 3.3 Batch C adds Currency/Duration/Time/Color -- members 13/14/15/16,
 * verified against the real backend enum (CustomFieldValueType.cs) and the
 * Wave 3.3 backend batch reports (Task A: Currency=13; Task B: Duration=14,
 * Time=15, Color=16, in that order). Wave 4 adds EntityReference/
 * UserReference -- members 17/18, read straight off the real enum
 * (CustomFieldValueType.cs declares `EntityReference = 17, UserReference =
 * 18`), not inferred from "the next two free numbers". UserReference is a
 * DISTINCT member rather than EntityReference pointed at an identity type,
 * because the stored integer is durable per-value data that has to keep
 * saying what the value MEANT after its definition is re-pointed -- see
 * UserReferenceValueTypeHandler's own doc comment for the full reasoning.
 * Wave 3.4 adds File/Image/RichText -- members 19/20/21, read straight off the
 * real enum (`CustomFieldValueType.cs` declares `File = 19, Image = 20,
 * RichText = 21`). File and Image are DISTINCT members rather than
 * EntityReference pinned at `media.file`, for the reason
 * `FileValueTypeHandler`/`ImageValueTypeHandler` give: both pin the same single
 * target key, so nothing would be left to tell an image-only field from a
 * general file field at write time if they shared one member.
 */
import type { FieldVisibilityRuleData } from "../../domain/fieldVisibility";

import type { CustomFieldValueTypeName } from "../../domain/entities/CustomFieldValue";
export type { CustomFieldValueTypeName };

/**
 * DateTime's wire shape (Wave 3.1 Task 7, ruling R7): a UTC instant plus a
 * per-value IANA zone id, both required once either piece is submitted --
 * mirrors the backend's `DateTimeZoneInput`/`DateTimeZoneValue` records
 * exactly (`{ "value": <instant>, "timeZoneId": <IANA id> }` on the wire,
 * property names verbatim, see DateTimeValueTypeHandler.cs). `value` is
 * typed as `string` here (an ISO-8601 UTC instant) rather than mirroring the
 * backend's wider `object?` acceptance (string/number/bool) -- every real
 * value this module ever WRITES is a `datetime-local` input string, and
 * every value it ever READS is a serialized `DateTime`, so `string` is the
 * only shape either direction of this module actually produces or expects.
 */
export interface CustomFieldDateTimeValue {
  value: string;
  timeZoneId: string;
}

/**
 * Currency's wire shape (Wave 3.3 Batch C, mirroring backend ruling R1/R2 and
 * CurrencyValueTypeHandler.Parse's own chosen envelope exactly):
 * `{ "amount": <number>, "currencyCode": <code> }`. Neither piece is
 * meaningful alone (R2's own justification for the new column), so this is a
 * two-piece object like CustomFieldDateTimeValue above, not a bare scalar --
 * `amount` stays `number | string` (not narrowed to `number`) because a
 * control mid-edit legitimately holds a partially-typed string ("12." or "")
 * before it parses as a real number, the same laxity CurrencyInput's own
 * `object? Amount` allows on the backend. `currencyCode` is nullable because
 * Project() reuses this same shape for a read where the code is (in
 * principle) missing -- see CurrencyValue's own doc comment.
 */
export interface CustomFieldCurrencyValue {
  amount: number | string;
  currencyCode: string | null;
}

/**
 * EntityReference/UserReference's wire shape (Wave 4) -- what a GET hands back
 * for a stored reference, and property-for-property what a save sends back up.
 * Mirrors the backend's `EntityReferenceProjection` record
 * (`EntityReferenceValueTypeHandler.cs`, bottom of file) on the way down and the
 * JSON properties `Parse` reads on the way up, which are the same two:
 * `{ "entityTypeKey": "hrms.staff-member", "entityId": "<encrypted>" }`. See the
 * note above `isEntityReferenceValue` for why that symmetry needs stating.
 *
 * `entityId` is ENCRYPTED -- it is another module's primary key, and this
 * product does not put raw primary keys on the wire. Send it back verbatim;
 * never parse it, never assume it is a GUID, never derive anything from its
 * length or shape.
 *
 * There is deliberately NO display-name property here, and there never will be.
 * `Project` refuses to snapshot one because a name stored next to the id would
 * be readable by anyone holding the OWNER record's view permission, while the
 * name itself is guarded by the TARGET entity type's own permission resource. A
 * name is data: the only way to render one is to resolve it live. So a stored
 * reference is rendered by calling the entity-lookup resolve endpoint, and a
 * resolved name must never be written back into form state that gets submitted.
 */
export interface CustomFieldEntityReferenceValue {
  entityTypeKey: string;
  entityId: string;
}

/**
 * EntityReference/UserReference read AND write with the SAME property names.
 * There is no translation step, and adding one is a data-loss bug -- this
 * paragraph exists because that bug was written, shipped into review, and
 * caught here.
 *
 * VERIFIED AGAINST REAL BACKEND SOURCE, because the C# is genuinely misleading
 * on this point:
 *  - `EntityReferenceValueTypeHandler.Parse` reads the JSON properties
 *    `entityTypeKey` and `entityId` (via `TryReadStringProperty`), and states
 *    that wire shape in its own doc comment.
 *  - It then builds `EntityReferenceInput(string? EntityTypeKey, string?
 *    EncryptedEntityId)` POSITIONALLY. `EncryptedEntityId` is a CLR property
 *    name describing what the string contains -- it is never a JSON property
 *    name. There is no `[JsonPropertyName]` on it and no converter, and a
 *    case-insensitive search of the whole backend finds the identifier only in
 *    that record declaration and its two property reads.
 *  - `EntityReferenceInput` is never deserialized at all:
 *    `SaveCustomFieldValuesRequest` carries `Dictionary<string, object?>`, so
 *    System.Text.Json fills it with `JsonElement`s and the handler parses them
 *    by hand.
 *  - `Project` emits `EntityReferenceProjection(EntityTypeKey, EntityId)`.
 *
 * So reading the C# record's parameter list and concluding "the write key is
 * `encryptedEntityId`" is the exact wrong turn to make here. WHAT ACTUALLY
 * HAPPENS if a save renames `entityId` to `encryptedEntityId`: `entityTypeKey`
 * survives, `entityId` is absent, `TryReadStringProperty` reports absent as
 * null-with-success by design, `IsEmpty` is false because it requires BOTH
 * pieces blank, and `Validate` refuses with a 422
 * `customFields.values.referenceIncomplete` -- so a fully-picked reference is
 * rejected with the message written for a half-filled one, on every single save.
 * On a create the record is already written by then, leaving a saved row with no
 * custom-field values at all.
 *
 * The correct save payload is the value the picker already emits, unchanged.
 */

/**
 * Shape guard for a reference value -- true when `v` is an object carrying both
 * reference properties as strings.
 *
 * SHAPE, NOT COMPLETENESS, and the distinction is deliberate: this is a
 * TypeScript type guard, so its job is "does this value have the reference
 * shape", which is what the control's value narrowing and the read-side
 * formatter each need to ask. Whether a reference is COMPLETE enough to store is
 * a separate question with a separate answer per caller -- required-field
 * emptiness (`isRequiredFieldEmpty` in generic-form.tsx) needs a blank
 * `entityId` to count as "not filled", while a half-blank that reaches the wire
 * must arrive intact so the backend answers with its own localized
 * `referenceIncomplete` 422 rather than being mistaken for a deliberate clear.
 *
 * @param v Any value -- unvalidated wire data, form state, anything.
 * @returns True when `v` has both `entityTypeKey` and `entityId` as strings.
 */
export function isEntityReferenceValue(v: unknown): v is CustomFieldEntityReferenceValue {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const candidate = v as { entityTypeKey?: unknown; entityId?: unknown };
  return typeof candidate.entityTypeKey === "string" && typeof candidate.entityId === "string";
}

/**
 * RichText's wire shape (Wave 3.4) -- a ONE-KEY OBJECT, in both directions:
 * `{ "html": "<p>hello</p>" }`. Mirrors the backend's `RichTextInput(string?
 * Html)` on the way up and `RichTextProjection(string Html)` on the way down;
 * both spell the single JSON property `html`, so, as with a reference, read and
 * write are the same shape and there is nothing to translate.
 *
 * WHY THE ENVELOPE EXISTS AT ALL, since a bare string is the obvious modelling
 * and is the one thing the backend REFUSES. `InputSanitizationMiddleware` strips
 * HTML tags out of every string in every request body except the paths listed in
 * `InputSanitizationOptions.HtmlBearingRoutes`, and the entry for the values PUT
 * is the PATH `values.*.html` -- pinned to the `html` member of a field's value
 * object. A bare string submitted at `values.myField` does not match that path,
 * so it would arrive at the handler already stripped of every tag: the server
 * would report success while storing prose whose paragraphs, links and lists had
 * been deleted in transit. So `RichTextValueTypeHandler.Parse` returns
 * `WasExtractable: false` for a bare string (and for a number, an array, and an
 * object whose `html` is present but not a string), which surfaces as a 422
 * `customFields.values.unsupportedType`.
 *
 * WHAT THAT MEANS FOR THIS LAYER: a control that emits a bare string is not
 * "slightly off", it is a field that can never be saved. `RichTextEditor` is
 * `value: string` / `onChange(html: string)`, so the wrap/unwrap has to happen
 * somewhere, and it happens in `RichTextCustomFieldControl` -- never in
 * `saveValues`, whose doc comment is a standing prohibition on per-type wire
 * translation in that loop.
 *
 * The stored markup is ALREADY SANITIZED by the time a read returns it: the
 * backend runs `HtmlAllowlistSanitizer.SanitizeRichText` at write time and
 * `Project` hands back exactly what was stored, which is what lets the editor
 * show the operator what was actually kept rather than what they typed. It is
 * still not a licence to inject it somewhere unrelated: the read-side table
 * formatter deliberately strips it to plain text rather than using
 * `dangerouslySetInnerHTML` in a cell.
 */
export interface CustomFieldRichTextValue {
  html: string;
}

/**
 * Shape guard for a rich-text value -- true when `v` is an object carrying
 * `html` as a string.
 *
 * SHAPE, NOT EMPTINESS, exactly like `isEntityReferenceValue` above and for the
 * same split of responsibilities: `{ html: "" }` passes this guard, because
 * whether an empty envelope counts as "nothing to save" is a question each
 * caller answers for itself (required-field emptiness in generic-form.tsx wants
 * blank markup to read as unfilled; the control wants to emit `null` rather than
 * `{ html: "" }` when the editor is cleared, so the field is genuinely cleared
 * server-side instead of storing an empty string).
 *
 * A BARE STRING IS REJECTED, which is the whole point of having a guard here
 * rather than `typeof v === "string"` anywhere: the wire shape is an object, a
 * string is the shape the backend refuses, and a guard that accepted both would
 * let the refused shape travel to the wire under the name of a valid value.
 *
 * @param v Any value -- unvalidated wire data, form state, anything.
 * @returns True when `v` is an object whose `html` property is a string.
 */
export function isRichTextValue(v: unknown): v is CustomFieldRichTextValue {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  return typeof (v as { html?: unknown }).html === "string";
}

/**
 * CustomFieldValue wire shape — one entity type's active definition merged with
 * its stored value (if any) for a specific owner record. Value's runtime type
 * follows valueType: string (Text/Select/LongText/Email/Url/Phone/Time/Color --
 * Wave 3.2 Batch 3's three ValueText scalars and Wave 3.3 Batch C's Time
 * (canonical "HH:mm:ss") and Color (lowercase hex) ValueText scalars need no
 * new shape, they are plain strings exactly like Text), number
 * (Number/Percent/Rating/Duration -- Batch 3's two ValueNumber scalars and
 * Batch C's Duration (minutes, decimal) are likewise plain numbers, no new
 * shape), boolean (Boolean), ISO-8601 UTC string (Date), string[]
 * (MultiSelect -- selected option labels, order-preserving per R5),
 * CustomFieldDateTimeValue (DateTime), CustomFieldCurrencyValue (Currency,
 * Batch C's own two-piece amount+code envelope),
 * CustomFieldEntityReferenceValue (EntityReference/UserReference -- Wave 4's
 * two-piece target-type + encrypted-id envelope, spelled identically on read and
 * on write, see that type's own doc comment; Wave 3.4's File/Image reuse that
 * SAME envelope verbatim, since both are references whose target is a
 * `media.file` row -- `FileValueTypeHandler` extends
 * `EntityReferenceValueTypeHandler` and inherits its `Project`, so there is no
 * new read shape to model for them), CustomFieldRichTextValue (RichText --
 * Wave 3.4's one-key `{ html }` envelope), or null.
 */
export interface EntityCustomFieldValueData {
  customFieldId: string;
  key: string;
  labelEn: string;
  labelAr?: string | null;
  placeholderEn?: string | null;
  placeholderAr?: string | null;
  valueType: CustomFieldValueTypeName;
  isRequired: boolean;
  options?: string[] | null;
  sortOrder: number;
  value:
    | string
    | number
    | boolean
    | string[]
    | CustomFieldDateTimeValue
    | CustomFieldCurrencyValue
    | CustomFieldEntityReferenceValue
    | CustomFieldRichTextValue
    | null;
  /**
   * Wave 5 row 5.3. True when a visibility rule hides this field for THIS record's current state, in
   * which case `value` is null regardless of what is stored.
   *
   * The field is REPORTED, not omitted — unlike a field-level-security restriction, which the server
   * strips entirely. The distinction is deliberate: a restricted field is one the caller may never
   * see, so the client must not learn it exists; a hidden field is one the caller may see as soon as
   * the record's own data makes it applicable, so the client needs to know about it in order to
   * reveal it when the operand changes.
   *
   * Optional because a server predating row 5.3 omits it; absent means "not hidden".
   */
  isHidden?: boolean;
  /**
   * Wave 5 row 5.3. Every rule governing this field, so a form can re-evaluate visibility LIVE.
   *
   * The rules travel rather than only their outcome because the CREATE form carries no owner id, so
   * the server has no values to evaluate against and marks every conditional field hidden — and it
   * cannot re-evaluate as the user types. See `fieldVisibility.ts`.
   */
  visibilityRules?: FieldVisibilityRuleData[] | null;
  /**
   * Wave 4 follow-up: for a reference field (EntityReference/UserReference), the entity type its
   * picker should offer — the key that goes straight into
   * `GET /api/v1/entity-lookup/{entityTypeKey}`. Null/absent for every other value type. Mirrors
   * `EntityCustomFieldValueResponse.ReferenceTargetEntityTypeKey`, which the read handler fills
   * through `IValueTypeHandlerRegistry.ResolveTargetEntityType` (verified in
   * `GetEntityCustomFieldValuesQueryHandler`, not assumed from the DTO's declaration).
   *
   * DEFINITION METADATA, DELIBERATELY NOT PART OF `value`, and the split is the whole point of this
   * property existing. A populated `value` already names the type it actually points at
   * (`CustomFieldEntityReferenceValue.entityTypeKey`), which is what keeps a historical reference
   * readable after an admin re-points the definition. THIS says what a NEW value may point at — and
   * an EMPTY reference field has no `value` at all, so without this the picker has nothing to go on
   * and can only render its "no target configured" state.
   *
   * A UserReference field carries `identity.user` here even when the admin pinned nothing: that
   * type's target allowlist has exactly one member, so the server answers from code
   * (`UserReferenceValueTypeHandler.ImplicitTargetEntityTypeKey`). It arrives through this same
   * property rather than a second channel precisely so the client needs one code path, not a
   * per-value-type branch — and so nothing downstream has to hardcode `identity.user` to duplicate
   * a backend allowlist it cannot see.
   *
   * Optional because a server predating the pin omits it; absent means "the definition does not say",
   * which is a real and permanent state for an unpinned EntityReference (any registered entity type
   * is a legal target, so there is no single answer to report).
   */
  referenceTargetEntityTypeKey?: string | null;
}

/**
 * One active custom-field definition shaped as a table-column header --
 * deliberately thinner than EntityCustomFieldValueData (no isRequired, no
 * per-row value): those don't vary per column, only per cell. Mirrors
 * CustomFields.Application.DTOs.CustomFieldColumnResponse.
 */
export interface CustomFieldColumnData {
  customFieldId: string;
  key: string;
  labelEn: string;
  labelAr: string | null;
  valueType: CustomFieldValueTypeName;
  options: string[] | null;
  sortOrder: number;
}

/**
 * Wire shape of POST /custom-fields/values/{entityTypeKey}/bulk -- active
 * definitions for entityTypeKey (as column headers) plus every requested
 * owner's stored values, keyed first by the exact (encrypted) owner id
 * string the caller sent, then by each definition's machine `key`. An owner
 * id the server couldn't verify (wrong tenant, deleted, malformed) is simply
 * absent from valuesByOwnerId -- render that row's custom-field cells empty,
 * not an error. Mirrors CustomFields.Application.DTOs.BulkEntityCustomFieldValuesResponse.
 */
export interface BulkEntityCustomFieldValuesData {
  columns: CustomFieldColumnData[];
  valuesByOwnerId: Record<string, Record<string, string | number | boolean | null>>;
  /**
   * Wave 5 row 5.3. Per owner, the field keys a visibility rule hides for THAT record. Absent owners
   * have no hidden fields; the whole map is absent when no rule applies anywhere.
   *
   * A parallel channel rather than a missing key inside `valuesByOwnerId`, because an absence there
   * already means two other things (no stored value, and an owner that failed the existence gate) —
   * and because a column exists once per result set while visibility varies per ROW, so this can
   * never be expressed by dropping a column.
   */
  hiddenKeysByOwnerId?: Record<string, string[]> | null;
}
