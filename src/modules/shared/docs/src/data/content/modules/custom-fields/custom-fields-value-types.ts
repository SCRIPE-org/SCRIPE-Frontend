// FILE-EXCEPTION: file length
/**
 * Custom Fields — Value Types reference page (product documentation).
 *
 * One block per value type: what it stores, what it checks, and a worked table
 * of accepted and rejected example inputs with the error code the product
 * actually returns. Error codes and caps here are taken from the CustomFields
 * value-type handlers and their resource strings, not paraphrased.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.valueTypes";

/** Example rows are [literal input or full locale key, outcome key suffix]. */
type ExampleRow = [string, string];

/** One value-type block: heading, what it stores, what it checks, examples. */
function typeBlock(anchor: string, name: string, rows: ExampleRow[]): DocSection[] {
  return [
    { type: "heading", level: 3, titleKey: `${K}.${name}Title`, id: anchor },
    { type: "paragraph", contentKey: `${K}.${name}Stores` },
    { type: "paragraph", contentKey: `${K}.${name}Checks` },
    {
      type: "table",
      headers: [`${K}.thExample`, `${K}.thOutcome`],
      rows: rows.map(([example, outcome]) => [example, `${K}.${outcome}`]),
    },
  ];
}

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "warning",
    titleKey: `${K}.permanentTitle`,
    contentKey: `${K}.permanentContent`,
  },

  // ─── How a value is checked ───────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.orderTitle`, id: "how-a-value-is-checked" },
  { type: "paragraph", contentKey: `${K}.orderIntro` },
  {
    type: "list",
    variant: "ordered",
    items: [`${K}.order1`, `${K}.order2`, `${K}.order3`, `${K}.order4`],
  },
  { type: "paragraph", contentKey: `${K}.orderKeyNote` },

  // ─── Text and choices ─────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.groupTextTitle`, id: "text-and-choices" },
  ...typeBlock("type-text", "text", [
    ["Egyptian", "textOk"],
    [`${K}.exText4500`, "textTooLong"],
    [`${K}.exSpacesOptional`, "textBlankOptional"],
    [`${K}.exSpacesRequired`, "textBlankRequired"],
  ]),
  ...typeBlock("type-long-text", "longText", [
    [`${K}.exLong6000`, "longTextOk"],
    [`${K}.exLong12000`, "longTextTooLong"],
  ]),
  ...typeBlock("type-select", "select", [
    ["Medium", "selectOk"],
    [`${K}.exSelectPadded`, "selectTrimmed"],
    ["medium", "selectCase"],
    ["Extra-Large", "selectUnknown"],
  ]),
  ...typeBlock("type-multi-select", "multiSelect", [
    [`${K}.exMultiTwo`, "multiOk"],
    [`${K}.exMultiTwenty`, "multiTooMany"],
    [`${K}.exMultiRepeat`, "multiDuplicate"],
    ["Purple", "multiUnknown"],
    [`${K}.exMultiEmptyList`, "multiEmpty"],
  ]),

  // ─── Numbers and measures ─────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.groupNumberTitle`, id: "numbers-and-measures" },
  ...typeBlock("type-number", "number", [
    ["42", "numberOk"],
    ["-17.5", "numberNegative"],
    ["1.2345678", "numberPrecision"],
    [`${K}.exAboutForty`, "numberInvalid"],
  ]),
  ...typeBlock("type-percent", "percent", [
    ["25", "percentOk"],
    ["33.5", "percentDecimal"],
    ["0.25", "percentQuarter"],
    ["150", "percentTooHigh"],
    ["-5", "percentNegative"],
  ]),
  ...typeBlock("type-rating", "rating", [
    ["4", "ratingOk"],
    ["0", "ratingZero"],
    ["3.5", "ratingFraction"],
    ["6", "ratingTooHigh"],
    [`${K}.exRatingUntouched`, "ratingUntouched"],
  ]),
  ...typeBlock("type-currency", "currency", [
    [`${K}.exCurrencyOk`, "currencyOk"],
    [`${K}.exCurrencyLower`, "currencyLower"],
    [`${K}.exCurrencyNoCode`, "currencyNoCode"],
    [`${K}.exCurrencyNoAmount`, "currencyNoAmount"],
    [`${K}.exCurrencyZzz`, "currencyZzz"],
    [`${K}.exCurrencyMinor`, "currencyMinor"],
  ]),
  ...typeBlock("type-duration", "duration", [
    ["90", "durationOk"],
    ["1.5", "durationFraction"],
    ["0", "durationZero"],
    ["5400", "durationLarge"],
    ["-5", "durationNegative"],
  ]),

  // ─── Dates and times ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.groupDateTitle`, id: "dates-and-times" },
  ...typeBlock("type-date", "date", [
    ["2026-08-21", "dateOk"],
    [`${K}.exDateWithTime`, "dateNoTime"],
    [`${K}.exNotADate`, "dateInvalid"],
  ]),
  ...typeBlock("type-date-time", "dateTime", [
    [`${K}.exDateTimeOk`, "dateTimeOk"],
    [`${K}.exDateTimeNoZone`, "dateTimeNoZone"],
    [`${K}.exDateTimeBadZone`, "dateTimeBadZone"],
    [`${K}.exDateTimeBothBlank`, "dateTimeEmpty"],
  ]),
  ...typeBlock("type-time", "time", [
    ["14:30:00", "timeOk"],
    ["9:5:0", "timeNormalised"],
    ["24:00:00", "timeHourRange"],
    ["12:60:00", "timeMinuteRange"],
    ["2:30 PM", "timeAmPm"],
  ]),

  // ─── Contact details and links ────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.groupContactTitle`, id: "contact-details" },
  ...typeBlock("type-email", "email", [
    ["User.Name+Tag@Example.COM", "emailOk"],
    [`${K}.exEmailDisplayName`, "emailDisplayName"],
    ["not-an-email", "emailInvalid"],
  ]),
  ...typeBlock("type-url", "url", [
    ["https://example.com/team", "urlOk"],
    ["http://localhost:3000", "urlHttpOk"],
    ["example.com", "urlNoScheme"],
    ["javascript:alert(1)", "urlScheme"],
    ["ftp://example.com", "urlFtp"],
  ]),
  ...typeBlock("type-phone", "phone", [
    ["+201234567890", "phoneOk"],
    ["01234567890", "phoneNoPlus"],
    ["+0123456789", "phoneLeadingZero"],
    ["+1234567", "phoneTooShort"],
    ["+10000000000", "phoneUnassignable"],
  ]),

  // ─── Yes/no and colour ────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.groupOtherTitle`, id: "yes-no-and-colour" },
  ...typeBlock("type-boolean", "boolean", [
    ["true", "boolTrue"],
    ["false", "boolFalse"],
    ["1", "boolOne"],
    ["yes", "boolYes"],
  ]),
  ...typeBlock("type-color", "color", [
    ["#AABBCC", "colorOk"],
    ["#abc", "colorShort"],
    ["aabbcc", "colorNoHash"],
    ["#ab", "colorBadLength"],
    ["red", "colorNamed"],
  ]),

  // ─── References ───────────────────────────────────────────
  // Wave 4's two types (EntityReference = 17, UserReference = 18). Their own
  // group rather than rows appended to another, because they are the only two
  // that store a pointer instead of a typed value -- and a short intro before
  // the blocks, since a table of accepted/refused inputs cannot carry the one
  // thing a reader has to know first (the name is never stored). The depth
  // lives on modules/custom-fields-references and its lookups sibling.
  { type: "heading", level: 2, titleKey: `${K}.groupReferenceTitle`, id: "references" },
  { type: "paragraph", contentKey: `${K}.referenceGroupIntro` },
  ...typeBlock("type-entity-reference", "entityReference", [
    [`${K}.exRefOk`, "refOk"],
    [`${K}.exRefTypeOnly`, "refIncomplete"],
    [`${K}.exRefIdOnly`, "refIncompleteToo"],
    [`${K}.exRefWrongType`, "refMismatch"],
    [`${K}.exRefUnknownType`, "refUnknownType"],
    [`${K}.exRefEdited`, "refInvalidId"],
    [`${K}.exRefNoAccess`, "refForbidden"],
    [`${K}.exRefBothBlank`, "refEmpty"],
  ]),
  ...typeBlock("type-user-reference", "userReference", [
    [`${K}.exUsrOk`, "usrOk"],
    [`${K}.exUsrDormant`, "usrDormant"],
    [`${K}.exUsrAdmin`, "usrAdminRefused"],
    [`${K}.exUsrGroup`, "usrGroupRefused"],
    [`${K}.exUsrTheme`, "usrThemeRefused"],
    [`${K}.exRefBothBlank`, "usrEmpty"],
  ]),

  // ─── Media and formatted text ──────────────────────────────
  // Wave 3.4's three types (File = 19, Image = 20, RichText = 21). File and
  // Image share the reference family's pointer shape -- see the group intro
  // for why they still get their own group instead of joining the one above --
  // and RichText stores real content, so its block is a typed-value one like
  // Text's, not a pointer-shaped one.
  { type: "heading", level: 2, titleKey: `${K}.groupMediaTitle`, id: "media-and-formatted-text" },
  { type: "paragraph", contentKey: `${K}.mediaGroupIntro` },
  ...typeBlock("type-file", "file", [
    [`${K}.fileAttachedExample`, "fileAttachedOutcome"],
    [`${K}.fileClearExample`, "fileClearOutcome"],
  ]),
  ...typeBlock("type-image", "image", [[`${K}.imageAttachedExample`, "imageAttachedOutcome"]]),
  ...typeBlock("type-rich-text", "richText", [
    [`${K}.richTextOkExample`, "richTextOkOutcome"],
    [`${K}.richTextStyleExample`, "richTextStyleOutcome"],
    [`${K}.richTextImgExample`, "richTextImgOutcome"],
    [`${K}.richTextTooLongExample`, "richTextTooLongOutcome"],
  ]),

  // ─── Empty values ─────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.emptyTitle`, id: "empty-values" },
  { type: "paragraph", contentKey: `${K}.emptyIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [
      `${K}.empty1`,
      `${K}.empty2`,
      `${K}.empty3`,
      `${K}.empty4`,
      `${K}.empty5`,
      `${K}.empty6`,
    ],
  },
  { type: "paragraph", contentKey: `${K}.emptyOutcome` },
  {
    type: "info",
    variant: "caution",
    titleKey: `${K}.emptyWarnTitle`,
    contentKey: `${K}.emptyWarnContent`,
  },

  // ─── Error codes ──────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.codesTitle`, id: "error-codes" },
  { type: "paragraph", contentKey: `${K}.codesIntro` },
  {
    type: "table",
    headers: [`${K}.thCode`, `${K}.thWhenItFires`],
    rows: [
      ["VALIDATION_REQUIRED", `${K}.codeRequired`],
      ["VALIDATION_INVALID_FORMAT", `${K}.codeInvalidFormat`],
      ["VALIDATION_INVALID_EMAIL", `${K}.codeInvalidEmail`],
      ["VALIDATION_INVALID_TIMEZONE", `${K}.codeInvalidTimezone`],
      ["VALIDATION_RANGE", `${K}.codeRange`],
      ["VALIDATION_MAX_LENGTH", `${K}.codeMaxLength`],
      ["VALIDATION_MIN_LENGTH", `${K}.codeMinLength`],
      ["VALIDATION_UNIQUE", `${K}.codeUnique`],
      // The three reference-specific refusals. AUTH_FORBIDDEN is a 403 rather
      // than a 422, which the intro above now says -- it is about the caller's
      // access to the referenced record, not about the shape of the value.
      ["ENTITY_UNKNOWN_TYPE", `${K}.codeUnknownEntityType`],
      ["ENTITY_INVALID_ID", `${K}.codeInvalidId`],
      ["AUTH_FORBIDDEN", `${K}.codeForbidden`],
      // File and Image add one more Forbidden refusal on top of the reference
      // ones above, plus a Validation refusal that is deliberately NOT
      // Forbidden even though it is about a file's own properties -- see the
      // intro copy for why. RichText's is a plain shape refusal.
      ["AUTH_FORBIDDEN", `${K}.codeMediaOwnerMismatch`],
      ["VALIDATION_INVALID_FORMAT", `${K}.codeMediaNotAnImage`],
      ["VALIDATION_INVALID_FORMAT", `${K}.codeRichTextShape`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.codesInfoTitle`,
    contentKey: `${K}.codesInfoContent`,
  },

  // ─── The in-product catalogue ─────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.catalogueTitle`, id: "value-types-catalogue" },
  { type: "paragraph", contentKey: `${K}.catalogueIntro` },
  { type: "paragraph", contentKey: `${K}.catalogueColumns` },
  { type: "paragraph", contentKey: `${K}.catalogueNoPlanColumn` },
];

registerPage({
  slug: "modules/custom-fields-value-types",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/custom-fields",
    "modules/custom-fields-references",
    "modules/custom-fields-validators",
  ],
  lastUpdated: "2026-08-21",
});
