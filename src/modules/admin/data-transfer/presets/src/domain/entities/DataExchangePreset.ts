import type {
  DataExchangeColumnMapping,
  DataExchangeImportMode,
} from "@core/data-exchange/domain/types";

/**
 * Domain entity representing a saved column mapping preset.
 */
export class DataExchangePreset {
  readonly id: string;
  readonly entityKey: string;
  readonly name: string;
  readonly importMode: DataExchangeImportMode;
  readonly mappings: DataExchangeColumnMapping[];
  readonly isDefault: boolean;
  readonly createdAt: string;

  constructor(init: {
    id: string;
    entityKey: string;
    name: string;
    importMode?: DataExchangeImportMode;
    mappings?: DataExchangeColumnMapping[];
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
