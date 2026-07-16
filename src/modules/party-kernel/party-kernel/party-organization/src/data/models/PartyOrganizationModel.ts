/**
* PartyOrganization Model (DTO)
*
* Represents the API data transfer object for PartyOrganization.
* Service uses this for API communication.
* Mapper converts between PartyOrganizationModel <-> PartyOrganization Entity.
      */

      /**
      * PartyOrganization JSON shape from API
      */
      export interface PartyOrganizationJson {
      id: string;
      partyId: string;
      legalName: string;
      taxId: string;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated PartyOrganization list response from API
      */
      export interface PartyOrganizationListResponseJson {
      items: PartyOrganizationJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * PartyOrganization Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class PartyOrganizationModel {
      constructor(
      public readonly id: string,
      public readonly partyId: string,
      public readonly legalName: string,
      public readonly taxId: string,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create PartyOrganizationModel from API JSON
      */
      static fromJson(json: PartyOrganizationJson): PartyOrganizationModel {
      return new PartyOrganizationModel(
      json.id,
      json.partyId,
      json.legalName,
      json.taxId,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert PartyOrganizationModel to API JSON
      */
      toJson(): PartyOrganizationJson {
      return {
      id: this.id,
      partyId: this.partyId,
      legalName: this.legalName,
      taxId: this.taxId,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }