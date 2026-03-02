/**
 * Edition Repository Interface
 */
import type { Edition } from "../entities/Edition";
import type { EditionVersion } from "../entities/EditionVersion";
import type { CreateEditionRequest, UpdateEditionRequest } from "../entities/EditionRequests";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

export interface IEditionRepository {
      getAll(params: PaginationParams & { includeRetired?: boolean }): Promise<PagedResult<Edition>>;
      getById(id: string): Promise<Edition>;
      create(request: CreateEditionRequest): Promise<string>;
      update(id: string, request: UpdateEditionRequest): Promise<void>;
      delete(id: string): Promise<void>;
      setFeatureValue(editionId: string, featureId: string, value: string): Promise<void>;

      // ── Versioning ──
      getVersions(editionId: string): Promise<EditionVersion[]>;
      createVersion(editionId: string, changeNotes?: string): Promise<string>;
      publishVersion(editionId: string, versionId: string, data: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number }): Promise<void>;
      cancelVersion(editionId: string, versionId: string): Promise<void>;
}
