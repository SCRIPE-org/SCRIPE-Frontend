/**
 * DeletedItem Model (DTO)
 *
 * Represents the API data transfer object for a deleted item.
 * Used by RecycleBinService for API communication.
 * Mapper converts between DeletedItemModel <-> DeletedItem Entity.
 *
 * @module recycle-bin/data
 */

/**
 * DeletedItem JSON shape from API (matches backend DeletedItemDto)
 */
export interface DeletedItemJson {
  id: string;
  entityType: string;
  name: string;
  email?: string;
  tenantName?: string;
  deletedAt?: string;
  deletedByName?: string;
  daysUntilPermanent: number;
}

/**
 * Grouped response JSON from API (matches backend DeletedItemsResponse)
 */
export interface DeletedItemsResponseJson {
  tenants: DeletedItemJson[];
  admins: DeletedItemJson[];
  users: DeletedItemJson[];
  roles: DeletedItemJson[];
  userGroups: DeletedItemJson[];
  totalCount: number;
}

/**
 * DeletedItem Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class DeletedItemModel {
  constructor(
    public readonly id: string,
    public readonly entityType: string,
    public readonly name: string,
    public readonly daysUntilPermanent: number,
    public readonly email?: string,
    public readonly tenantName?: string,
    public readonly deletedAt?: string,
    public readonly deletedByName?: string
  ) {}

  /**
   * Create DeletedItemModel from API JSON
   */
  static fromJson(json: DeletedItemJson): DeletedItemModel {
    return new DeletedItemModel(
      json.id,
      json.entityType,
      json.name,
      json.daysUntilPermanent,
      json.email,
      json.tenantName,
      json.deletedAt,
      json.deletedByName
    );
  }

  /**
   * Convert DeletedItemModel to API JSON
   */
  toJson(): DeletedItemJson {
    return {
      id: this.id,
      entityType: this.entityType,
      name: this.name,
      daysUntilPermanent: this.daysUntilPermanent,
      email: this.email,
      tenantName: this.tenantName,
      deletedAt: this.deletedAt,
      deletedByName: this.deletedByName,
    };
  }
}
