/**
* StaffMember Model (DTO)
*
* Represents the API data transfer object for StaffMember.
* Service uses this for API communication.
* Mapper converts between StaffMemberModel <-> StaffMember Entity.
      */

      /**
      * StaffMember JSON shape from API
      */
      export interface StaffMemberJson {
      id: string;
      identityUserId: string;
      firstName: string;
      lastName: string;
      email: string;
      jobTitle: string;
      isActive: boolean;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated StaffMember list response from API
      */
      export interface StaffMemberListResponseJson {
      items: StaffMemberJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * StaffMember Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class StaffMemberModel {
      constructor(
      public readonly id: string,
      public readonly identityUserId: string,
      public readonly firstName: string,
      public readonly lastName: string,
      public readonly email: string,
      public readonly jobTitle: string,
      public readonly isActive: boolean,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      ) {}

      /**
      * Create StaffMemberModel from API JSON
      */
      static fromJson(json: StaffMemberJson): StaffMemberModel {
      return new StaffMemberModel(
      json.id,
      json.identityUserId,
      json.firstName,
      json.lastName,
      json.email,
      json.jobTitle,
      json.isActive,
      json.createdAt,
      json.modifiedAt,
      );
      }

      /**
      * Convert StaffMemberModel to API JSON
      */
      toJson(): StaffMemberJson {
      return {
      id: this.id,
      identityUserId: this.identityUserId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      jobTitle: this.jobTitle,
      isActive: this.isActive,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      };
      }
      }