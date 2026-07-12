/**
* ContactPoint Model (DTO)
*
* Represents the API data transfer object for ContactPoint.
* Service uses this for API communication.
* Mapper converts between ContactPointModel <-> ContactPoint Entity.
      */

      /**
      * ContactPoint JSON shape from API
      */
      export interface ContactPointJson {
      id: string;
      partyId: string;
      type: string;
      value: string;
      isPrimary: boolean;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated ContactPoint list response from API
      */
      export interface ContactPointListResponseJson {
      items: ContactPointJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * ContactPoint Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class ContactPointModel {
      constructor(
      public readonly id: string,
      public readonly partyId: string,
      public readonly type: string,
      public readonly value: string,
      public readonly isPrimary: boolean,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create ContactPointModel from API JSON
      */
      static fromJson(json: ContactPointJson): ContactPointModel {
      return new ContactPointModel(
      json.id,
      json.partyId,
      json.type,
      json.value,
      json.isPrimary,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert ContactPointModel to API JSON
      */
      toJson(): ContactPointJson {
      return {
      id: this.id,
      partyId: this.partyId,
      type: this.type,
      value: this.value,
      isPrimary: this.isPrimary,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }