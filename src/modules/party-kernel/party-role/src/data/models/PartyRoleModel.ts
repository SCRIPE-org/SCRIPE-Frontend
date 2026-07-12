/**
* PartyRole Model (DTO)
*
* Represents the API data transfer object for PartyRole.
* Service uses this for API communication.
* Mapper converts between PartyRoleModel <-> PartyRole Entity.
      */

      /**
      * PartyRole JSON shape from API
      */
      export interface PartyRoleJson {
      id: string;
      partyId: string;
      roleType: string;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated PartyRole list response from API
      */
      export interface PartyRoleListResponseJson {
      items: PartyRoleJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * PartyRole Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class PartyRoleModel {
      constructor(
      public readonly id: string,
      public readonly partyId: string,
      public readonly roleType: string,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create PartyRoleModel from API JSON
      */
      static fromJson(json: PartyRoleJson): PartyRoleModel {
      return new PartyRoleModel(
      json.id,
      json.partyId,
      json.roleType,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert PartyRoleModel to API JSON
      */
      toJson(): PartyRoleJson {
      return {
      id: this.id,
      partyId: this.partyId,
      roleType: this.roleType,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }