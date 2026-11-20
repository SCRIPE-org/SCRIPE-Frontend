/**
 * Client-side mapping compatibility checks and deterministic sample normalization
 * for SCRIPE Data Exchange Studio.
 */

export {
  isMaskedSentinelSample,
  normalizeDigitsForPreview,
  isNumericSample,
  isBoolSample,
  isDateSample,
  formatByteSize,
} from "./validation/sample-predicates";

export {
  validateSheetMappings,
  findMissingRequiredFields,
  isExpressTemplateMatch,
} from "./validation/sheet-compatibility";

export { previewNormalizedSample } from "./validation/sample-normalizer";
