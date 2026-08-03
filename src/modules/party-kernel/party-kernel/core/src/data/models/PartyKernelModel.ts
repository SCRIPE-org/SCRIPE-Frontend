/**
 * PartyKernel Model (DTO)
 *
 * Represents the API data transfer object for PartyKernel.
 * Service uses this for API communication.
 * Mapper converts between PartyKernelModel <-> PartyKernel Entity.
 */

/**
 * PartyKernel JSON shape from API
 */
export interface PartyKernelJson {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Paginated PartyKernel list response from API
 */
export interface PartyKernelListResponseJson {
  items: PartyKernelJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * PartyKernel Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class PartyKernelModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: string,
    public readonly modifiedAt?: string
  ) {}

  /**
   * Create PartyKernelModel from API JSON
   */
  static fromJson(json: PartyKernelJson): PartyKernelModel {
    return new PartyKernelModel(json.id, json.name, json.createdAt, json.modifiedAt);
  }

  /**
   * Convert PartyKernelModel to API JSON
   */
  toJson(): PartyKernelJson {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}
