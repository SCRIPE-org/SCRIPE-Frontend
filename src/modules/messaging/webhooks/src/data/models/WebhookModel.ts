// FILE-EXCEPTION: file length
/**
 * Webhook Model (DTO)
 *
 * Represents the raw API response/request shapes for webhooks.
 * Service returns these; Mapper converts them to domain Entities.
 *
 * @module webhooks/data
 */

// ===== JSON Shapes (API contracts) =====

/**
 * Interface structure detailing the properties and attributes of Webhook Subscription Json.
 */
export interface WebhookSubscriptionJson {
  id: string;
  scope: string;
  tenantId: string | null;
  tenantName: string | null;
  url: string;
  description: string | null;
  events: string[];
  isActive: boolean;
  secret: string;
  hasPreviousSecret: boolean;
  previousSecretExpiresAt: string | null;
  maxRetries: number;
  consecutiveFailures: number;
  maxConsecutiveFailures: number;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: string | null;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  createdAt: string;
  modifiedAt: string | null;
}

/**
 * Interface structure detailing the properties and attributes of Webhook List Item Json.
 */
export interface WebhookListItemJson {
  id: string;
  scope: string;
  tenantName: string | null;
  url: string;
  description: string | null;
  events: string[];
  isActive: boolean;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: string | null;
  successRate: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
}

/**
 * Interface structure detailing the properties and attributes of Webhook List Response Json.
 */
export interface WebhookListResponseJson {
  items: WebhookListItemJson[];
  totalCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Webhook Delivery Log Json.
 */
export interface WebhookDeliveryLogJson {
  id: string;
  eventDeliveryId: string;
  eventType: string;
  payloadJson: string;
  requestUrl: string;
  requestHeaders: string | null;
  httpStatusCode: number;
  responseBody: string | null;
  errorMessage: string | null;
  status: string;
  nextRetryAt: string | null;
  maxAttempts: number;
  attemptNumber: number;
  latencyMs: number;
  isSuccess: boolean;
  createdAt: string;
}

/**
 * Interface structure detailing the properties and attributes of Webhook Delivery Log List Response Json.
 */
export interface WebhookDeliveryLogListResponseJson {
  items: WebhookDeliveryLogJson[];
  totalCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Webhook Delivery Stats Json.
 */
export interface WebhookDeliveryStatsJson {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageLatencyMs: number;
}

/**
 * Interface structure detailing the properties and attributes of Webhook Event Type Json.
 */
export interface WebhookEventTypeJson {
  key: string;
  category: string;
  description: string;
}

/**
 * Interface structure detailing the properties and attributes of Webhook Test Result Json.
 */
export interface WebhookTestResultJson {
  isSuccess: boolean;
  statusCode: number;
  latencyMs: number;
  responsePreview: string | null;
  errorMessage: string | null;
}

// ===== Analytics & Health JSON Shapes =====

/**
 * Interface structure detailing the properties and attributes of Daily Delivery Stats Json.
 */
export interface DailyDeliveryStatsJson {
  date: string;
  total: number;
  delivered: number;
  failed: number;
  avgLatencyMs: number;
}

/**
 * Interface structure detailing the properties and attributes of Webhook Analytics Json.
 */
export interface WebhookAnalyticsJson {
  successRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  totalEvents: number;
  deliveredEvents: number;
  failedEvents: number;
  deadLetteredCount: number;
  retryingCount: number;
  dailyStats: DailyDeliveryStatsJson[];
}

/**
 * Interface structure detailing the properties and attributes of Webhook Health Summary Json.
 */
export interface WebhookHealthSummaryJson {
  activeEndpoints: number;
  disabledEndpoints: number;
  autoDisabledEndpoints: number;
  systemSuccessRate: number;
  last24hTotal: number;
  last24hDelivered: number;
  last24hFailed: number;
  totalDeadLettered: number;
  totalRetrying: number;
  avgLatencyMs: number;
}

/**
 * Interface structure detailing the properties and attributes of Create Webhook Json.
 */
export interface CreateWebhookJson {
  url: string;
  description?: string;
  events: string[];
  scope?: string;
  maxRetries?: number;
  maxConsecutiveFailures?: number;
}

/**
 * Interface structure detailing the properties and attributes of Update Webhook Json.
 */
export interface UpdateWebhookJson {
  url?: string;
  description?: string;
  events?: string[];
  scope?: string;
  maxRetries?: number;
  maxConsecutiveFailures?: number;
}

// ===== Model Classes =====

/**
 * Webhook Subscription Model
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class WebhookSubscriptionModel {
  constructor(
    public readonly id: string,
    public readonly scope: string,
    public readonly tenantId: string | null,
    public readonly tenantName: string | null,
    public readonly url: string,
    public readonly description: string | null,
    public readonly events: string[],
    public readonly isActive: boolean,
    public readonly secret: string,
    public readonly hasPreviousSecret: boolean,
    public readonly previousSecretExpiresAt: string | null,
    public readonly maxRetries: number,
    public readonly consecutiveFailures: number,
    public readonly maxConsecutiveFailures: number,
    public readonly lastDeliveryAt: string | null,
    public readonly lastDeliveryStatus: string | null,
    public readonly totalDeliveries: number,
    public readonly successfulDeliveries: number,
    public readonly failedDeliveries: number,
    public readonly successRate: number,
    public readonly createdAt: string,
    public readonly modifiedAt: string | null
  ) {}

  static fromJson(json: WebhookSubscriptionJson): WebhookSubscriptionModel {
    return new WebhookSubscriptionModel(
      json.id,
      json.scope,
      json.tenantId,
      json.tenantName,
      json.url,
      json.description,
      json.events,
      json.isActive,
      json.secret,
      json.hasPreviousSecret,
      json.previousSecretExpiresAt,
      json.maxRetries,
      json.consecutiveFailures,
      json.maxConsecutiveFailures,
      json.lastDeliveryAt,
      json.lastDeliveryStatus,
      json.totalDeliveries,
      json.successfulDeliveries,
      json.failedDeliveries,
      json.successRate,
      json.createdAt,
      json.modifiedAt
    );
  }

  toJson(): WebhookSubscriptionJson {
    return {
      id: this.id,
      scope: this.scope,
      tenantId: this.tenantId,
      tenantName: this.tenantName,
      url: this.url,
      description: this.description,
      events: this.events,
      isActive: this.isActive,
      secret: this.secret,
      hasPreviousSecret: this.hasPreviousSecret,
      previousSecretExpiresAt: this.previousSecretExpiresAt,
      maxRetries: this.maxRetries,
      consecutiveFailures: this.consecutiveFailures,
      maxConsecutiveFailures: this.maxConsecutiveFailures,
      lastDeliveryAt: this.lastDeliveryAt,
      lastDeliveryStatus: this.lastDeliveryStatus,
      totalDeliveries: this.totalDeliveries,
      successfulDeliveries: this.successfulDeliveries,
      failedDeliveries: this.failedDeliveries,
      successRate: this.successRate,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}

/**
 * Webhook List Item Model
 */
export class WebhookListItemModel {
  constructor(
    public readonly id: string,
    public readonly scope: string,
    public readonly tenantName: string | null,
    public readonly url: string,
    public readonly description: string | null,
    public readonly events: string[],
    public readonly isActive: boolean,
    public readonly lastDeliveryAt: string | null,
    public readonly lastDeliveryStatus: string | null,
    public readonly successRate: number,
    public readonly totalDeliveries: number,
    public readonly successfulDeliveries: number,
    public readonly failedDeliveries: number
  ) {}

  static fromJson(json: WebhookListItemJson): WebhookListItemModel {
    return new WebhookListItemModel(
      json.id,
      json.scope,
      json.tenantName ?? null,
      json.url ?? "",
      json.description,
      json.events,
      json.isActive,
      json.lastDeliveryAt,
      json.lastDeliveryStatus,
      json.successRate,
      json.totalDeliveries,
      json.successfulDeliveries,
      json.failedDeliveries
    );
  }
}

/**
 * Create webhook request model
 */
export class CreateWebhookModel {
  constructor(
    public readonly url: string,
    public readonly events: string[],
    public readonly description?: string,
    public readonly scope?: string,
    public readonly maxRetries?: number,
    public readonly maxConsecutiveFailures?: number
  ) {}

  toJson(): CreateWebhookJson {
    return {
      url: this.url,
      description: this.description,
      events: this.events,
      scope: this.scope,
      maxRetries: this.maxRetries,
      maxConsecutiveFailures: this.maxConsecutiveFailures,
    };
  }
}

/**
 * Update webhook request model
 */
export class UpdateWebhookModel {
  constructor(
    public readonly url?: string,
    public readonly description?: string,
    public readonly events?: string[],
    public readonly scope?: string,
    public readonly maxRetries?: number,
    public readonly maxConsecutiveFailures?: number
  ) {}

  toJson(): UpdateWebhookJson {
    return {
      url: this.url,
      description: this.description,
      events: this.events,
      scope: this.scope,
      maxRetries: this.maxRetries,
      maxConsecutiveFailures: this.maxConsecutiveFailures,
    };
  }
}
