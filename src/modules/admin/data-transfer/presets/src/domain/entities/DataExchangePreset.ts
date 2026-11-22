/** Import mode assigned to a saved mapping preset. */
export type PresetImportMode = "Insert" | "Update" | "Upsert";

/** Column normalization rules attached to a preset mapping entry. */
export interface PresetTransformRule {
  trim?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  defaultValue?: string | null;
  dateFormat?: string | null;
  sourceTimeZoneId?: string | null;
  canonicalizeNullTokens?: boolean;
  collapseWhitespace?: boolean;
  normalizeUnicodeCompatibility?: boolean;
  stripArabicDiacritics?: boolean;
  normalizeArabicLetters?: boolean;
  caseMode?: "None" | "Lower" | "Upper" | "Title";
  stripCurrencyAndGrouping?: boolean;
  convertAccountingNegatives?: boolean;
  defaultCountryDialCode?: string | null;
  normalizeEmailAddress?: boolean;
  multiValueDelimiter?: string | null;
}

/** Single column mapping definition inside a saved preset. */
export interface PresetColumnMapping {
  sourceColumnHeader: string;
  targetFieldKey: string;
  transform?: PresetTransformRule | null;
  resolveByField?: string | null;
}

/**
 * Domain entity representing a saved column mapping preset.
 */
export class DataExchangePreset {
  readonly id: string;
  readonly entityKey: string;
  readonly name: string;
  readonly importMode: PresetImportMode;
  readonly mappings: PresetColumnMapping[];
  readonly isDefault: boolean;
  readonly createdAt: string;

  constructor(init: {
    id: string;
    entityKey: string;
    name: string;
    importMode?: PresetImportMode;
    mappings?: PresetColumnMapping[];
    isDefault?: boolean;
    createdAt?: string;
  }) {
    this.id = init.id;
    this.entityKey = init.entityKey;
    this.name = init.name;
    this.importMode = init.importMode ?? "Insert";
    this.mappings = init.mappings ?? [];
    this.isDefault = init.isDefault ?? false;
    this.createdAt = init.createdAt ?? new Date().toISOString();
  }

  /**
   * Returns the count of mapped columns.
   */
  get mappingCount(): number {
    return this.mappings.length;
  }

  /**
   * Immutable copy method.
   */
  copyWith(changes: Partial<DataExchangePreset>): DataExchangePreset {
    return new DataExchangePreset({
      id: changes.id ?? this.id,
      entityKey: changes.entityKey ?? this.entityKey,
      name: changes.name ?? this.name,
      importMode: changes.importMode ?? this.importMode,
      mappings: changes.mappings ?? this.mappings,
      isDefault: changes.isDefault ?? this.isDefault,
      createdAt: changes.createdAt ?? this.createdAt,
    });
  }
}
