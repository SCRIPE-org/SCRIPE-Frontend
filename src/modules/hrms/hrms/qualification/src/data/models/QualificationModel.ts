/**
* Qualification Model (DTO)
*
* Represents the API data transfer object for Qualification.
* Service uses this for API communication.
* Mapper converts between QualificationModel <-> Qualification Entity.
      */

      /**
      * Qualification JSON shape from API
      */
      export interface QualificationJson {
      id: string;
      staffMemberId: string;
      title: string;
      institution: string;
      awardedOn: Date;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated Qualification list response from API
      */
      export interface QualificationListResponseJson {
      items: QualificationJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * Qualification Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class QualificationModel {
      constructor(
      public readonly id: string,
      public readonly staffMemberId: string,
      public readonly title: string,
      public readonly institution: string,
      public readonly awardedOn: Date,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create QualificationModel from API JSON
      */
      static fromJson(json: QualificationJson): QualificationModel {
      return new QualificationModel(
      json.id,
      json.staffMemberId,
      json.title,
      json.institution,
      json.awardedOn,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert QualificationModel to API JSON
      */
      toJson(): QualificationJson {
      return {
      id: this.id,
      staffMemberId: this.staffMemberId,
      title: this.title,
      institution: this.institution,
      awardedOn: this.awardedOn,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }