import type { DeveloperEntity } from "../entities/DeveloperEntity";

export interface IDeveloperRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: DeveloperEntity[]; totalCount: number }>;
  getOverview(): Promise<unknown>;
  testWebhook(url: string): Promise<unknown>;
  getWebhookEvents(): Promise<unknown>;
  getSdkExamples(): Promise<unknown>;
  getHealth(): Promise<unknown>;
}
