export interface IDeveloperService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  getOverview(): Promise<unknown>;
  testWebhook(url: string): Promise<unknown>;
  getWebhookEvents(): Promise<unknown>;
  getSdkExamples(): Promise<unknown>;
  getHealth(): Promise<unknown>;
}
