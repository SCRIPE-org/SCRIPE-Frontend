/**
* Party Model (DTO)
*
* Represents the API data transfer object for Party.
* Service uses this for API communication.
* Mapper converts between PartyModel <-> Party Entity.
      */

      /**
      * Party JSON shape from API
      */
      export interface PartyJson {
      id: string;
      type: string;
      displayName: string;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated Party list response from API
      */
      export interface PartyListResponseJson {
      items: PartyJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * Party Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class PartyModel {
      constructor(
      public readonly id: string,
      public readonly type: string,
      public readonly displayName: string,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create PartyModel from API JSON
      */
      static fromJson(json: PartyJson): PartyModel {
      return new PartyModel(
      json.id,
      json.type,
      json.displayName,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert PartyModel to API JSON
      */
      toJson(): PartyJson {
      return {
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }