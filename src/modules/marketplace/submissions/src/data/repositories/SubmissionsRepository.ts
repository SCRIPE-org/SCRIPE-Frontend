/**
 * SubmissionsRepository
 *
 * Bridges the service and domain layers:
 * 1. Delegates HTTP calls to SubmissionsService (injected via ISubmissionsService)
 * 2. Maps DTOs → AppSubmission domain entities
 * 3. Returns typed domain entities to the presentation layer
 *
 * Architecture (H-02 refactor):
 *   ViewModel → SubmissionsRepository (this) → ISubmissionsService → IApiService → HTTP
 */
import type { ISubmissionsService } from "../../domain/interfaces/ISubmissionsService";
import { AppSubmission } from "../../domain/entities/AppSubmission";
import type { AppSubmissionData } from "../../domain/entities/AppSubmission";
import type { ISubmissionsRepository } from "../../domain/interfaces/ISubmissionsRepository";
import type { SubmissionDto } from "../../domain/interfaces/ISubmissionsService";

/**
 * Repository layer implementing client request queries for submissions.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class SubmissionsRepository implements ISubmissionsRepository {
  constructor(private readonly service: ISubmissionsService) {}

  async getAll(params: { page: number; pageSize: number; status?: string }) {
    const data = await this.service.getAll(params);
    return { ...data, items: (data.items ?? []).map(this.map) };
  }

  async getById(id: string): Promise<AppSubmission> {
    return this.map(await this.service.getById(id));
  }

  async create(payload: Parameters<ISubmissionsRepository["create"]>[0]): Promise<string> {
    const r = await this.service.create(payload);
    return r.id;
  }

  /** M-10 fix: sends { feedback } as body, matching ReviewSubmissionRequest. */
  async approve(id: string, feedback: string = ""): Promise<void> {
    await this.service.approve(id, feedback);
  }

  /** M-11 fix: sends { feedback } matching backend expectation. */
  async reject(id: string, feedback: string): Promise<void> {
    await this.service.reject(id, feedback);
  }

  async requestRevisions(id: string, feedback: string): Promise<void> {
    await this.service.requestRevisions(id, feedback);
  }

  private map(d: SubmissionDto): AppSubmission {
    return new AppSubmission({
      id: d.id,
      appListingId: d.appListingId,
      appName: d.appName ?? "",
      developerName: d.developerName ?? "",
      submittedVersion: d.submittedVersion ?? "",
      status: (d.status ?? "Pending") as AppSubmissionData["status"],
      reviewerNotes: d.reviewerNotes ?? null,
      submittedAt: d.submittedAt ?? new Date().toISOString(),
      reviewedAt: d.reviewedAt ?? null,
    });
  }
}
