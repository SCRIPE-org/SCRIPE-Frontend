/**
 * Documentation for module export
 */
export interface SetupFieldOption {
  value: string;
  label: string;
}

/**
 * Splits raw options string into trimmed non-empty items.
 * Supports newline-delimited (backend standard), comma-separated, and mixed formats.
 */
function splitRawOptionItems(raw: string): string[] {
  if (raw.includes("\n")) {
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parses and positionally aligns English and Arabic options for account setup custom fields.
 * Supports newline-separated strings, comma-separated lists, and JSON arrays.
 */
export function parseSetupCustomFieldOptions(
  options?: string | null,
  optionsAr?: string | null,
  isRtl?: boolean
): SetupFieldOption[] {
  if (!options) return [];

  let enList: SetupFieldOption[] = [];
  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) {
      enList = parsed.map((item) => {
        if (typeof item === "object" && item !== null) {
          const val = item.value ?? item.label ?? item.labelEn ?? "";
          const lab = item.label ?? item.labelEn ?? item.value ?? "";
          return { value: String(val), label: String(lab) };
        }
        return { value: String(item), label: String(item) };
      });
    } else {
      enList = splitRawOptionItems(options).map((s) => ({ value: s, label: s }));
    }
  } catch {
    enList = splitRawOptionItems(options).map((s) => ({ value: s, label: s }));
  }

  if (!isRtl || !optionsAr) {
    return enList;
  }

  let arLabels: string[] = [];
  try {
    const parsedAr = JSON.parse(optionsAr);
    if (Array.isArray(parsedAr)) {
      arLabels = parsedAr.map((item) => {
        if (typeof item === "object" && item !== null) {
          return String(item.labelAr ?? item.label ?? item.value ?? "");
        }
        return String(item);
      });
    } else {
      arLabels = splitRawOptionItems(optionsAr);
    }
  } catch {
    arLabels = splitRawOptionItems(optionsAr);
  }

  if (arLabels.length === 0) return enList;

  return enList.map((opt, idx) => ({
    value: opt.value,
    label: arLabels[idx] || opt.label,
  }));
}
