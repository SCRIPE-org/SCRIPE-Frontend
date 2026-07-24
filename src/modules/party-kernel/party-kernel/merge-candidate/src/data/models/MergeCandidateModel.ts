/**
* MergeCandidate Model (DTO)
*
* Represents the API data transfer object for MergeCandidate.
* Service uses this for API communication.
* Mapper converts between MergeCandidateModel <-> MergeCandidate Entity.
      */

      /**
      * MergeCandidate JSON shape from API
      */
      export interface MergeCandidateJson {
      id: string;
      primaryPartyId: string;
      duplicatePartyId: string;
      status: string;
      reason: string;
      matchScore?: number;
      createdAt: string;
      modifiedAt?: string;
      }

      /**
      * Paginated MergeCandidate list response from API
      */
      export interface MergeCandidateListResponseJson {
      items: MergeCandidateJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      }

      /**
      * MergeCandidate Model class
      *
      * Wraps API JSON with fromJson/toJson methods.
      */
      export class MergeCandidateModel {
      constructor(
      public readonly id: string,
      public readonly primaryPartyId: string,
      public readonly duplicatePartyId: string,
      public readonly status: string,
      public readonly reason: string,
      public readonly createdAt: string,
      public readonly modifiedAt?: string,
      public readonly matchScore?: number,
      ) {}

      /**
      * Create MergeCandidateModel from API JSON
      */
      static fromJson(json: MergeCandidateJson): MergeCandidateModel {
      return new MergeCandidateModel(
      json.id,
      json.primaryPartyId,
      json.duplicatePartyId,
      json.status,
      json.reason,
      json.createdAt,
      json.modifiedAt,
      json.matchScore,
      );
      }

      /**
      * Convert MergeCandidateModel to API JSON
      */
      toJson(): MergeCandidateJson {
      return {
      id: this.id,
      primaryPartyId: this.primaryPartyId,
      duplicatePartyId: this.duplicatePartyId,
      status: this.status,
      reason: this.reason,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      matchScore: this.matchScore,
      };
      }
      }