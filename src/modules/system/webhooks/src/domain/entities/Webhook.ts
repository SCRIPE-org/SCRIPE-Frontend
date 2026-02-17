/**
 * Webhook entities — domain types for the webhook management module.
 */

// ─── Subscription ──────────────────────────────────────────────

export interface WebhookSubscription {
      id: string;
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

export interface WebhookSubscriptionListItem {
      id: string;
      url: string;
      description: string | null;
      events: string[];
      isActive: boolean;
      lastDeliveryAt: string | null;
      lastDeliveryStatus: string | null;
      successRate: number;
      totalDeliveries: number;
      consecutiveFailures: number;
      maxConsecutiveFailures: number;
      createdAt: string;
}

// ─── Delivery Log ──────────────────────────────────────────────

export interface WebhookDeliveryLog {
      id: string;
      subscriptionId: string;
      eventType: string;
      payloadJson: string;
      requestUrl: string;
      requestHeaders: string | null;
      httpStatusCode: number;
      responseBody: string | null;
      errorMessage: string | null;
      attemptNumber: number;
      latencyMs: number;
      isSuccess: boolean;
      createdAt: string;
}

// ─── Stats ─────────────────────────────────────────────────────

export interface WebhookDeliveryStats {
      totalDeliveries: number;
      successfulDeliveries: number;
      failedDeliveries: number;
      successRate: number;
      averageLatencyMs: number;
}

// ─── Event Catalog ─────────────────────────────────────────────

export interface WebhookEventType {
      key: string;
      category: string;
      description: string;
}

// ─── Test Result ───────────────────────────────────────────────

export interface WebhookTestResult {
      isSuccess: boolean;
      statusCode: number;
      latencyMs: number;
      responsePreview: string | null;
      errorMessage: string | null;
}

// ─── Request Payloads ──────────────────────────────────────────

export interface CreateWebhookRequest {
      url: string;
      description?: string;
      events: string[];
      maxRetries?: number;
      maxConsecutiveFailures?: number;
}

export interface UpdateWebhookRequest {
      url?: string;
      description?: string;
      events?: string[];
      maxRetries?: number;
      maxConsecutiveFailures?: number;
}

// ─── List Response ─────────────────────────────────────────────

export interface WebhookListResponse {
      items: WebhookSubscriptionListItem[];
      totalCount: number;
}
