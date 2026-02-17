/**
 * Webhook Entities — Domain types for the webhook management module.
 *
 * Classes with getters and domain logic.
 * Request payloads are in WebhookRequests.ts.
 *
 * @module webhooks/domain
 */

// ─── Subscription Data ─────────────────────────────────────────

export interface WebhookSubscriptionData {
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

/**
 * Webhook Subscription Entity
 */
export class WebhookSubscription {
      constructor(private readonly data: WebhookSubscriptionData) { }

      get id(): string {
            return this.data.id;
      }
      get url(): string {
            return this.data.url;
      }
      get description(): string | null {
            return this.data.description;
      }
      get events(): string[] {
            return this.data.events;
      }
      get isActive(): boolean {
            return this.data.isActive;
      }
      get secret(): string {
            return this.data.secret;
      }
      get hasPreviousSecret(): boolean {
            return this.data.hasPreviousSecret;
      }
      get previousSecretExpiresAt(): string | null {
            return this.data.previousSecretExpiresAt;
      }
      get maxRetries(): number {
            return this.data.maxRetries;
      }
      get consecutiveFailures(): number {
            return this.data.consecutiveFailures;
      }
      get maxConsecutiveFailures(): number {
            return this.data.maxConsecutiveFailures;
      }
      get lastDeliveryAt(): string | null {
            return this.data.lastDeliveryAt;
      }
      get lastDeliveryStatus(): string | null {
            return this.data.lastDeliveryStatus;
      }
      get totalDeliveries(): number {
            return this.data.totalDeliveries;
      }
      get successfulDeliveries(): number {
            return this.data.successfulDeliveries;
      }
      get failedDeliveries(): number {
            return this.data.failedDeliveries;
      }
      get successRate(): number {
            return this.data.successRate;
      }
      get createdAt(): string {
            return this.data.createdAt;
      }
      get modifiedAt(): string | null {
            return this.data.modifiedAt;
      }

      // ===== Domain Logic =====

      /** Whether auto-disabled due to consecutive failures reaching the limit */
      get isAutoDisabled(): boolean {
            return this.consecutiveFailures >= this.maxConsecutiveFailures;
      }

      /** Display name: description if present, otherwise the URL */
      get displayName(): string {
            return this.description || this.url;
      }

      /** Number of subscribed events */
      get eventCount(): number {
            return this.events.length;
      }

      /** Whether the secret is being rotated (grace period active) */
      get isRotatingSecret(): boolean {
            return this.hasPreviousSecret && this.previousSecretExpiresAt !== null;
      }
}

// ─── Subscription List Item ─────────────────────────────────────

export interface WebhookSubscriptionListItemData {
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

/**
 * Webhook Subscription List Item Entity
 */
export class WebhookSubscriptionListItem {
      constructor(private readonly data: WebhookSubscriptionListItemData) { }

      get id(): string {
            return this.data.id;
      }
      get url(): string {
            return this.data.url;
      }
      get description(): string | null {
            return this.data.description;
      }
      get events(): string[] {
            return this.data.events;
      }
      get isActive(): boolean {
            return this.data.isActive;
      }
      get lastDeliveryAt(): string | null {
            return this.data.lastDeliveryAt;
      }
      get lastDeliveryStatus(): string | null {
            return this.data.lastDeliveryStatus;
      }
      get successRate(): number {
            return this.data.successRate;
      }
      get totalDeliveries(): number {
            return this.data.totalDeliveries;
      }
      get consecutiveFailures(): number {
            return this.data.consecutiveFailures;
      }
      get maxConsecutiveFailures(): number {
            return this.data.maxConsecutiveFailures;
      }
      get createdAt(): string {
            return this.data.createdAt;
      }

      // ===== Domain Logic =====

      get displayName(): string {
            return this.description || this.url;
      }

      get isAutoDisabled(): boolean {
            return this.consecutiveFailures >= this.maxConsecutiveFailures;
      }
}

// ─── Delivery Log ──────────────────────────────────────────────

export interface WebhookDeliveryLogData {
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

/**
 * Webhook Delivery Log Entity
 */
export class WebhookDeliveryLog {
      constructor(private readonly data: WebhookDeliveryLogData) { }

      get id(): string {
            return this.data.id;
      }
      get subscriptionId(): string {
            return this.data.subscriptionId;
      }
      get eventType(): string {
            return this.data.eventType;
      }
      get payloadJson(): string {
            return this.data.payloadJson;
      }
      get requestUrl(): string {
            return this.data.requestUrl;
      }
      get requestHeaders(): string | null {
            return this.data.requestHeaders;
      }
      get httpStatusCode(): number {
            return this.data.httpStatusCode;
      }
      get responseBody(): string | null {
            return this.data.responseBody;
      }
      get errorMessage(): string | null {
            return this.data.errorMessage;
      }
      get attemptNumber(): number {
            return this.data.attemptNumber;
      }
      get latencyMs(): number {
            return this.data.latencyMs;
      }
      get isSuccess(): boolean {
            return this.data.isSuccess;
      }
      get createdAt(): string {
            return this.data.createdAt;
      }
}

// ─── Stats ─────────────────────────────────────────────────────

/**
 * Webhook Delivery Stats Entity
 */
export class WebhookDeliveryStats {
      constructor(
            public readonly totalDeliveries: number,
            public readonly successfulDeliveries: number,
            public readonly failedDeliveries: number,
            public readonly successRate: number,
            public readonly averageLatencyMs: number
      ) { }
}

// ─── Event Catalog ─────────────────────────────────────────────

/**
 * Webhook Event Type Entity
 */
export class WebhookEventType {
      constructor(
            public readonly key: string,
            public readonly category: string,
            public readonly description: string
      ) { }
}

// ─── Test Result ───────────────────────────────────────────────

/**
 * Webhook Test Result Entity
 */
export class WebhookTestResult {
      constructor(
            public readonly isSuccess: boolean,
            public readonly statusCode: number,
            public readonly latencyMs: number,
            public readonly responsePreview: string | null,
            public readonly errorMessage: string | null
      ) { }
}

// ─── List Response ─────────────────────────────────────────────

export interface WebhookListResponse {
      items: WebhookSubscriptionListItem[];
      totalCount: number;
}
