/**
 * Webhook Service Interface
 *
 * Defines the contract for Webhook API operations.
 * Service returns Models (DTOs), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module webhooks/domain
 */
import type {
  WebhookSubscriptionJson,
  WebhookListResponseJson,
  WebhookDeliveryLogListResponseJson,
  WebhookEventTypeJson,
  WebhookTestResultJson,
  WebhookAnalyticsJson,
  WebhookHealthSummaryJson,
  CreateWebhookJson,
  UpdateWebhookJson,
} from "../types/WebhookTypes";

/**
 * Webhook list query parameters
 */
export interface ServiceWebhookListParams {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Delivery log query parameters
 */
export interface ServiceDeliveryLogParams {
  subscriptionId: string;
  page: number;
  pageSize: number;
  isSuccess?: boolean;
  status?: string;
}

/**
 * Dead letter list query parameters
 */
export interface ServiceDeadLetterParams {
  subscriptionId: string;
  page: number;
  pageSize: number;
}

/**
 * Http API network service for i webhook.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IWebhookService {
  // ─── CRUD ─────────────────────────────────────────
  getAll(params: ServiceWebhookListParams): Promise<WebhookListResponseJson>;
  getById(id: string): Promise<WebhookSubscriptionJson>;
  create(data: CreateWebhookJson): Promise<WebhookSubscriptionJson>;
  update(id: string, data: UpdateWebhookJson): Promise<void>;
  remove(id: string): Promise<void>;
  toggle(id: string): Promise<void>;
  rotateSecret(id: string): Promise<WebhookSubscriptionJson>;
  test(id: string): Promise<WebhookTestResultJson>;

  // ─── Delivery Logs ────────────────────────────────
  getDeliveryLogs(params: ServiceDeliveryLogParams): Promise<WebhookDeliveryLogListResponseJson>;
  getAvailableEvents(): Promise<WebhookEventTypeJson[]>;
  getDeliveryStats(subscriptionId: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
    averageLatencyMs: number;
  }>;

  // ─── Analytics & Health ───────────────────────────
  getAnalytics(subscriptionId: string, days?: number): Promise<WebhookAnalyticsJson>;
  getHealthSummary(): Promise<WebhookHealthSummaryJson>;

  // ─── Dead Letter Queue ────────────────────────────
  getDeadLetters(params: ServiceDeadLetterParams): Promise<WebhookDeliveryLogListResponseJson>;
  replayDeadLetter(logId: string): Promise<void>;
  replayAllDeadLetters(subscriptionId: string): Promise<void>;

  // ─── Bulk Operations ──────────────────────────────
  bulkToggle(isActive: boolean): Promise<void>;
}
