/**
 * Webhook Entities — Domain types for the webhook management module.
 *
 * Classes with getters and domain logic.
 * Request payloads are in WebhookRequests.ts.
 *
 * @module webhooks/domain
 */

// ─── Delivery Status Type ──────────────────────────────────────

export type DeliveryStatus = 'Pending' | 'Delivered' | 'Retrying' | 'DeadLettered';

// ─── Subscription Data ─────────────────────────────────────────

export interface WebhookSubscriptionData {
      id: string;
      scope: string;
      tenantId: string | null;
      tenantName: string | null;
      includeChildren: boolean;
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
      get scope(): string {
            return this.data.scope;
      }
      get tenantId(): string | null {
            return this.data.tenantId;
      }
      get tenantName(): string | null {
            return this.data.tenantName;
      }
      get includeChildren(): boolean {
            return this.data.includeChildren;
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

      /** Human-readable scope label */
      get scopeLabel(): string {
            switch (this.scope) {
                  case 'system': return 'System';
                  case 'hierarchy': return 'Hierarchy';
                  case 'tenant': return 'Tenant';
                  default: return this.scope;
            }
      }
}

// ─── Subscription List Item ─────────────────────────────────────

export interface WebhookSubscriptionListItemData {
      id: string;
      scope: string;
      tenantName: string | null;
      includeChildren: boolean;
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
 * Webhook Subscription List Item Entity
 */
export class WebhookSubscriptionListItem {
      constructor(private readonly data: WebhookSubscriptionListItemData) { }

      get id(): string {
            return this.data.id;
      }
      get scope(): string {
            return this.data.scope;
      }
      get tenantName(): string | null {
            return this.data.tenantName;
      }
      get includeChildren(): boolean {
            return this.data.includeChildren;
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
      get successfulDeliveries(): number {
            return this.data.successfulDeliveries;
      }
      get failedDeliveries(): number {
            return this.data.failedDeliveries;
      }

      // ===== Domain Logic =====

      get displayName(): string {
            return this.description || this.url;
      }

      get isAutoDisabled(): boolean {
            return !this.isActive && this.lastDeliveryStatus === 'Auto-disabled';
      }

      /** Human-readable scope label */
      get scopeLabel(): string {
            switch (this.scope) {
                  case 'system': return 'System';
                  case 'hierarchy': return 'Hierarchy';
                  case 'tenant': return 'Tenant';
                  default: return this.scope;
            }
      }
}

// ─── Delivery Log ──────────────────────────────────────────────

export interface WebhookDeliveryLogData {
      id: string;
      eventDeliveryId: string;
      eventType: string;
      payloadJson: string;
      requestUrl: string;
      requestHeaders: string | null;
      httpStatusCode: number;
      responseBody: string | null;
      errorMessage: string | null;
      status: DeliveryStatus;
      nextRetryAt: string | null;
      maxAttempts: number;
      attemptNumber: number;
      latencyMs: number;
      isSuccess: boolean;
      createdAt: string;
}

/**
 * Webhook Delivery Log Entity — enhanced with persistent retry fields
 */
export class WebhookDeliveryLog {
      constructor(private readonly data: WebhookDeliveryLogData) { }

      get id(): string {
            return this.data.id;
      }
      get eventDeliveryId(): string {
            return this.data.eventDeliveryId;
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
      get status(): DeliveryStatus {
            return this.data.status;
      }
      get nextRetryAt(): string | null {
            return this.data.nextRetryAt;
      }
      get maxAttempts(): number {
            return this.data.maxAttempts;
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

      // ===== Domain Logic =====

      /** Whether this delivery is waiting for retry */
      get isPendingRetry(): boolean {
            return this.status === 'Retrying' && this.nextRetryAt !== null;
      }

      /** Whether this delivery has been permanently failed */
      get isDeadLettered(): boolean {
            return this.status === 'DeadLettered';
      }

      /** Whether this can be replayed (only dead-lettered items) */
      get canReplay(): boolean {
            return this.status === 'DeadLettered';
      }

      /** Status color for UI badges */
      get statusColor(): 'success' | 'warning' | 'error' | 'default' {
            switch (this.status) {
                  case 'Delivered': return 'success';
                  case 'Retrying': return 'warning';
                  case 'DeadLettered': return 'error';
                  default: return 'default';
            }
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

// ─── Analytics ─────────────────────────────────────────────────

export interface DailyDeliveryStats {
      date: string;
      total: number;
      delivered: number;
      failed: number;
      avgLatencyMs: number;
}

export interface WebhookAnalyticsData {
      successRate: number;
      avgLatencyMs: number;
      p95LatencyMs: number;
      totalEvents: number;
      deliveredEvents: number;
      failedEvents: number;
      deadLetteredCount: number;
      retryingCount: number;
      dailyStats: DailyDeliveryStats[];
}

/**
 * Webhook Analytics Entity — delivery performance metrics for a subscription
 */
export class WebhookAnalytics {
      constructor(private readonly data: WebhookAnalyticsData) { }

      get successRate(): number { return this.data.successRate; }
      get avgLatencyMs(): number { return this.data.avgLatencyMs; }
      get p95LatencyMs(): number { return this.data.p95LatencyMs; }
      get totalEvents(): number { return this.data.totalEvents; }
      get deliveredEvents(): number { return this.data.deliveredEvents; }
      get failedEvents(): number { return this.data.failedEvents; }
      get deadLetteredCount(): number { return this.data.deadLetteredCount; }
      get retryingCount(): number { return this.data.retryingCount; }
      get dailyStats(): DailyDeliveryStats[] { return this.data.dailyStats; }
}

// ─── Health Summary ────────────────────────────────────────────

export interface WebhookHealthSummaryData {
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
 * Webhook Health Summary Entity — system-wide webhook dashboard data
 */
export class WebhookHealthSummary {
      constructor(private readonly data: WebhookHealthSummaryData) { }

      get activeEndpoints(): number { return this.data.activeEndpoints; }
      get disabledEndpoints(): number { return this.data.disabledEndpoints; }
      get autoDisabledEndpoints(): number { return this.data.autoDisabledEndpoints; }
      get systemSuccessRate(): number { return this.data.systemSuccessRate; }
      get last24hTotal(): number { return this.data.last24hTotal; }
      get last24hDelivered(): number { return this.data.last24hDelivered; }
      get last24hFailed(): number { return this.data.last24hFailed; }
      get totalDeadLettered(): number { return this.data.totalDeadLettered; }
      get totalRetrying(): number { return this.data.totalRetrying; }
      get avgLatencyMs(): number { return this.data.avgLatencyMs; }

      /** Total endpoints (active + disabled) */
      get totalEndpoints(): number {
            return this.activeEndpoints + this.disabledEndpoints;
      }

      /** Whether there are entries needing attention */
      get hasAlerts(): boolean {
            return this.totalDeadLettered > 0 || this.autoDisabledEndpoints > 0;
      }
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
