import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import { AppSubmission } from "../../domain/entities/AppSubmission";
import type { ISubmissionsRepository } from "../../domain/interfaces/ISubmissionsRepository";

export class SubmissionsRepository implements ISubmissionsRepository {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; status?: string }) {
    const q = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.status && { status: params.status }) });
    const data = await this.api.get<any>(`${MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSIONS}?${q}`);
    return { ...data, items: (data.items ?? []).map(this.map) };
  }

  async getById(id: string): Promise<AppSubmission> {
    const data = await this.api.get<any>(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_BY_ID(id));
    return this.map(data);
  }

  async create(payload: any): Promise<string> {
    const r = await this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSIONS, payload);
    return r.id;
  }

  async approve(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_APPROVE(id), {});
  }

  async reject(id: string, notes: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_REJECT(id), { notes });
  }

  async requestRevisions(id: string, notes: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_REQUEST_REVISIONS(id), { notes });
  }

  private map(d: any): AppSubmission {
    return new AppSubmission({
      id: d.id, appListingId: d.appListingId, appName: d.appName ?? "",
      developerName: d.developerName ?? "", submittedVersion: d.submittedVersion ?? "",
      status: d.status ?? "Pending", reviewerNotes: d.reviewerNotes ?? null,
      submittedAt: d.submittedAt ?? new Date().toISOString(), reviewedAt: d.reviewedAt ?? null,
    });
  }
}
