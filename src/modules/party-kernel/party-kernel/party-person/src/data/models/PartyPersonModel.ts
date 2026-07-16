/**
* PartyPerson Model (DTO)
*
* Represents the API data transfer object for PartyPerson.
* Service uses this for API communication.
* Mapper converts between PartyPersonModel <-> PartyPerson Entity.
      */

      /**
      * PartyPerson JSON shape from API
      */
      export interface PartyPersonJson {
      id: string;
      partyId: string;
      firstName: string;
      lastName: string;
      isMinor: boolean;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated PartyPerson list response from API
      */
      export interface PartyPersonListResponseJson {
      items: PartyPersonJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * PartyPerson Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class PartyPersonModel {
      constructor(
      public readonly id: string,
      public readonly partyId: string,
      public readonly firstName: string,
      public readonly lastName: string,
      public readonly isMinor: boolean,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create PartyPersonModel from API JSON
      */
      static fromJson(json: PartyPersonJson): PartyPersonModel {
      return new PartyPersonModel(
      json.id,
      json.partyId,
      json.firstName,
      json.lastName,
      json.isMinor,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert PartyPersonModel to API JSON
      */
      toJson(): PartyPersonJson {
      return {
      id: this.id,
      partyId: this.partyId,
      firstName: this.firstName,
      lastName: this.lastName,
      isMinor: this.isMinor,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }