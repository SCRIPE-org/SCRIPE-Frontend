// FILE-EXCEPTION: file length
/**
 * Custom Fields — Text validators (product documentation).
 *
 * One block per built-in check, with accepted and rejected example inputs and
 * the error code the product returns. Shapes, length caps, checksum coverage
 * and the supported PostalCode country list are taken from the CustomFields
 * validator presets, not paraphrased.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.validators";

/** Example rows are [literal input or full locale key, outcome key suffix]. */
type ExampleRow = [string, string];

/** One validator block: heading, what it is for, what it checks, examples. */
function validatorBlock(anchor: string, name: string, rows: ExampleRow[]): DocSection[] {
  return [
    { type: "heading", level: 3, titleKey: `${K}.${name}Title`, id: anchor },
    { type: "paragraph", contentKey: `${K}.${name}For` },
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
    titleKey: `${K}.textOnlyTitle`,
    contentKey: `${K}.textOnlyContent`,
  },

  // ─── Why there is no regex box ────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.whyClosedTitle`, id: "why-a-closed-list" },
  { type: "paragraph", contentKey: `${K}.whyClosedIntro` },

  // ─── How a validator runs ─────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.howTitle`, id: "how-a-validator-runs" },
  { type: "paragraph", contentKey: `${K}.howIntro` },
  {
    type: "list",
    variant: "ordered",
    items: [`${K}.how1`, `${K}.how2`, `${K}.how3`, `${K}.how4`],
  },
  { type: "paragraph", contentKey: `${K}.howTwoPoints` },

  // ─── The seven fixed-format checks ────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.fixedTitle`, id: "fixed-format-checks" },
  { type: "paragraph", contentKey: `${K}.fixedIntro` },
  {
    type: "table",
    headers: [`${K}.thValidator`, `${K}.thShape`, `${K}.thMaxLength`, `${K}.thChecksum`],
    rows: [
      ["IBAN", `${K}.shapeIban`, "34", `${K}.checksumReal`],
      ["IMEI", `${K}.shapeImei`, "15", `${K}.checksumReal`],
      ["SWIFT / BIC Code", `${K}.shapeSwift`, "11", `${K}.checksumNone`],
      ["Vehicle Plate Number", `${K}.shapePlate`, "15", `${K}.checksumNone`],
      ["Egyptian National ID", `${K}.shapeEgypt`, "14", `${K}.checksumUnpublished`],
      ["Saudi National ID", `${K}.shapeSaudi`, "10", `${K}.checksumReal`],
      ["Emirati ID (UAE)", `${K}.shapeEmirati`, "18", `${K}.checksumUnpublished`],
    ],
  },
  ...validatorBlock("validator-iban", "iban", [
    ["DE89370400440532013000", "ibanOk"],
    ["DE88370400440532013000", "ibanBadCheck"],
    ["de89370400440532013000", "ibanLower"],
    ["DE89 3704 0044 0532 0130 00", "ibanSpaces"],
  ]),
  ...validatorBlock("validator-imei", "imei", [
    ["490154203237518", "imeiOk"],
    ["490154203237519", "imeiBadCheck"],
    ["49015420323751", "imeiShort"],
  ]),
  ...validatorBlock("validator-swift-bic", "swiftBic", [
    ["DEUTDEFF", "swiftOk8"],
    ["DEUTDEFF500", "swiftOk11"],
    ["1EUTDEFF", "swiftDigit"],
    ["deutdeff", "swiftLower"],
    ["DEUTDEFF5", "swiftLength"],
  ]),
  ...validatorBlock("validator-vehicle-plate", "plate", [
    ["ABC 1234", "plateOk"],
    ["abc-1234", "plateLowerOk"],
    ["A", "plateTooShort"],
    ["ABC/1234", "plateBadChar"],
  ]),
  ...validatorBlock("validator-egyptian-id", "egyptId", [
    ["29005150112345", "egyptOk"],
    ["29013150112345", "egyptBadMonth"],
    ["29005320112345", "egyptBadDay"],
    ["19005150112345", "egyptBadCentury"],
    ["2900515011234", "egyptLength"],
  ]),
  ...validatorBlock("validator-saudi-id", "saudiId", [
    ["1234567897", "saudiOk"],
    ["1234567890", "saudiBadCheck"],
    ["3234567897", "saudiBadPrefix"],
    ["123456789", "saudiLength"],
  ]),
  ...validatorBlock("validator-emirati-id", "emiratiId", [
    ["784-1990-1234567-8", "emiratiOk"],
    ["784199012345678", "emiratiNoHyphens"],
    ["785-1990-1234567-8", "emiratiBadPrefix"],
    ["784-1990-123456-8", "emiratiLength"],
  ]),

  // ─── The six checks that take a setting ───────────────────
  { type: "heading", level: 2, titleKey: `${K}.paramTitle`, id: "checks-with-a-setting" },
  { type: "paragraph", contentKey: `${K}.paramIntro` },
  {
    type: "table",
    headers: [`${K}.thValidator`, `${K}.thParamFormat`, `${K}.thParamExample`],
    rows: [
      ["Postal Code", `${K}.paramFmtPostal`, "EG"],
      ["Numeric Range", `${K}.paramFmtNumeric`, "1,100"],
      ["Length Range", `${K}.paramFmtLength`, "2,50"],
      ["One of a List", `${K}.paramFmtOneOf`, `${K}.paramExOneOf`],
      ["Contains Text", `${K}.paramFmtContains`, "FC-"],
      ["Starts With Text", `${K}.paramFmtStartsWith`, "EG-"],
    ],
  },
  ...validatorBlock("validator-postal-code", "postal", [
    [`${K}.exPostalEg`, "postalEgOk"],
    [`${K}.exPostalEgBad`, "postalEgBad"],
    [`${K}.exPostalUsPlus4`, "postalUsOk"],
    [`${K}.exPostalGb`, "postalGbOk"],
    [`${K}.exPostalCa`, "postalCaOk"],
  ]),
  ...validatorBlock("validator-numeric-range", "numericRange", [
    [`${K}.exNumeric50`, "numericOk"],
    [`${K}.exNumeric150`, "numericOut"],
    [`${K}.exNumericText`, "numericNotANumber"],
    [`${K}.exNumericOpen`, "numericOpenOk"],
    [`${K}.exNumericBothBlank`, "numericBothBlank"],
  ]),
  ...validatorBlock("validator-length-range", "lengthRange", [
    [`${K}.exLength10`, "lengthOk"],
    [`${K}.exLength1`, "lengthTooShort"],
    [`${K}.exLength80`, "lengthTooLong"],
  ]),
  ...validatorBlock("validator-one-of-list", "oneOfList", [
    ["Goalkeeper", "oneOfOk"],
    ["goalkeeper", "oneOfCase"],
    ["Sweeper", "oneOfUnknown"],
  ]),
  ...validatorBlock("validator-contains", "contains", [
    ["FC-2026-014", "containsOk"],
    ["fc-2026-014", "containsCase"],
    ["2026-014", "containsMissing"],
  ]),
  ...validatorBlock("validator-starts-with", "startsWith", [
    ["EG-114-22", "startsOk"],
    ["114-EG-22", "startsWrongPlace"],
    ["eg-114-22", "startsCase"],
  ]),

  // ─── Postal Code countries ────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.postalCountriesTitle`, id: "postal-code-countries" },
  { type: "paragraph", contentKey: `${K}.postalCountriesIntro` },
  {
    type: "table",
    headers: [`${K}.thCountry`, `${K}.thFormat`, `${K}.thValidExample`],
    rows: [
      ["EG — Egypt", `${K}.fmtEg`, "11511"],
      ["SA — Saudi Arabia", `${K}.fmtSa`, "12345 / 12345-6789"],
      ["US — United States", `${K}.fmtUs`, "90210 / 90210-1234"],
      ["GB — United Kingdom", `${K}.fmtGb`, "SW1A 1AA"],
      ["DE — Germany", `${K}.fmtDe`, "10115"],
      ["FR — France", `${K}.fmtFr`, "75001"],
      ["CA — Canada", `${K}.fmtCa`, "K1A 0B1"],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.uaeTitle`,
    contentKey: `${K}.uaeContent`,
  },

  // ─── Attaching a validator: rejections ────────────────────
  { type: "heading", level: 2, titleKey: `${K}.attachTitle`, id: "attaching-a-validator" },
  { type: "paragraph", contentKey: `${K}.attachIntro` },
  {
    type: "table",
    headers: [`${K}.thSituation`, `${K}.thWhatYouSee`],
    rows: [
      [`${K}.attNonText`, `${K}.attNonTextMsg`],
      [`${K}.attNoParam`, `${K}.attNoParamMsg`],
      [`${K}.attExtraParam`, `${K}.attExtraParamMsg`],
      [`${K}.attBadRange`, `${K}.attBadRangeMsg`],
      [`${K}.attNoBound`, `${K}.attNoBoundMsg`],
      [`${K}.attUnsupportedCountry`, `${K}.attUnsupportedCountryMsg`],
      [`${K}.attUae`, `${K}.attUaeMsg`],
    ],
  },

  // ─── Error codes ──────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.codesTitle`, id: "validator-error-codes" },
  { type: "paragraph", contentKey: `${K}.codesIntro` },
  {
    type: "table",
    headers: [`${K}.thCode`, `${K}.thWhenItFires`],
    rows: [
      ["VALIDATION_INVALID_FORMAT", `${K}.codeInvalidFormat`],
      ["VALIDATION_RANGE", `${K}.codeRange`],
      ["VALIDATION_MAX_LENGTH", `${K}.codeMaxLength`],
      ["VALIDATION_MIN_LENGTH", `${K}.codeMinLength`],
      ["VALIDATION_REQUIRED", `${K}.codeRequired`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.codesInfoTitle`,
    contentKey: `${K}.codesInfoContent`,
  },

  // ─── Limits ───────────────────────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.limitsTitle`, id: "validator-limits" },
  {
    type: "list",
    variant: "unordered",
    items: [
      `${K}.limit1`,
      `${K}.limit2`,
      `${K}.limit3`,
      `${K}.limit4`,
      `${K}.limit5`,
      `${K}.limit6`,
    ],
  },
];

registerPage({
  slug: "modules/custom-fields-validators",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 6,
  sections,
  relatedSlugs: ["modules/custom-fields-value-types", "modules/custom-fields-limits"],
  lastUpdated: "2026-08-21",
});
