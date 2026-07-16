/**
* Certification Model (DTO)
*
* Represents the API data transfer object for Certification.
* Service uses this for API communication.
* Mapper converts between CertificationModel <-> Certification Entity.
      */

      /**
      * Certification JSON shape from API
      */
      export interface CertificationJson {
      id: string;
      staffMemberId: string;
      name: string;
      issuer: string;
      issuedOn: Date;
      expiresOn: Date;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated Certification list response from API
      */
      export interface CertificationListResponseJson {
      items: CertificationJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * Certification Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class CertificationModel {
      constructor(
      public readonly id: string,
      public readonly staffMemberId: string,
      public readonly name: string,
      public readonly issuer: string,
      public readonly issuedOn: Date,
      public readonly expiresOn: Date,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create CertificationModel from API JSON
      */
      static fromJson(json: CertificationJson): CertificationModel {
      return new CertificationModel(
      json.id,
      json.staffMemberId,
      json.name,
      json.issuer,
      json.issuedOn,
      json.expiresOn,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert CertificationModel to API JSON
      */
      toJson(): CertificationJson {
      return {
      id: this.id,
      staffMemberId: this.staffMemberId,
      name: this.name,
      issuer: this.issuer,
      issuedOn: this.issuedOn,
      expiresOn: this.expiresOn,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }