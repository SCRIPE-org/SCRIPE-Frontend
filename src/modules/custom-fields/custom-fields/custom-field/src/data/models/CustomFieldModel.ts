/**
 * CustomField Model (DTO)
 *
 * Represents the API data transfer object for CustomField.
 * Service uses this for API communication.
 * Mapper converts between CustomFieldModel <-> CustomField Entity.
 */

/**
 * EntityType item JSON shape from API.
 */
export interface EntityTypeItemJson {
  key: string;
  owningModule: string;
  displayNameEn: string;
  displayNameAr: string;
}

/**
 * CustomField JSON shape from API (detail / GET-by-id).
 */
export interface CustomFieldJson {
  id: string;
  entityTypeKey: string;
  key: string;
  labelEn: string;
  labelAr?: string | null;
  valueType: number;
  isRequired: boolean;
  options?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string | null;
}

/**
 * CustomField list-row JSON shape from API.
 * The list response omits `options` and `modifiedAt`.
 */
export interface CustomFieldListItemJson {
  id: string;
  entityTypeKey: string;
  key: string;
  labelEn: string;
  labelAr?: string | null;
  valueType: number;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * Paginated CustomField list response from API
 */
export interface CustomFieldListResponseJson {
  items: CustomFieldListItemJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * CustomField Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class CustomFieldModel {
  constructor(
    public readonly id: string,
    public readonly entityTypeKey: string,
    public readonly key: string,
    public readonly labelEn: string,
    public readonly valueType: number,
    public readonly isRequired: boolean,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly labelAr?: string | null,
    public readonly options?: string | null,
    public readonly modifiedAt?: string | null
  ) {}

  /**
   * Create CustomFieldModel from API detail JSON
   */
  static fromJson(json: CustomFieldJson): CustomFieldModel {
    return new CustomFieldModel(
      json.id,
      json.entityTypeKey,
      json.key,
      json.labelEn,
      json.valueType,
      json.isRequired,
      json.sortOrder,
      json.isActive,
      json.createdAt,
      json.labelAr,
      json.options,
      json.modifiedAt
    );
  }

  /**
   * Create CustomFieldModel from API list-row JSON (no options / modifiedAt)
   */
  static fromListJson(json: CustomFieldListItemJson): CustomFieldModel {
    return new CustomFieldModel(
      json.id,
      json.entityTypeKey,
      json.key,
      json.labelEn,
      json.valueType,
      json.isRequired,
      json.sortOrder,
      json.isActive,
      json.createdAt,
      json.labelAr,
      null,
      null
    );
  }

  /**
   * Convert CustomFieldModel to API JSON
   */
  toJson(): CustomFieldJson {
    return {
      id: this.id,
      entityTypeKey: this.entityTypeKey,
      key: this.key,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      valueType: this.valueType,
      isRequired: this.isRequired,
      options: this.options,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
