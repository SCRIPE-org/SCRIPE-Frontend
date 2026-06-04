/**
 * Webhook Mapper
 *
 * Converts between Webhook Models (DTOs) and Entities (Domain).
 * Repository uses this to transform service responses.
 *
 * @module webhooks/data
 */
import {
  WebhookSubscription,
  WebhookSubscriptionListItem,
  WebhookDeliveryLog,
  WebhookEventType,
  WebhookTestResult,
  WebhookDeliveryStats,
  WebhookAnalytics,
  WebhookHealthSummary,
  type WebhookSubscriptionData,
  type WebhookSubscriptionListItemData,
  type WebhookDeliveryLogData,
  type DeliveryStatus,
} from "../../domain/entities/Webhook";
import {
  WebhookSubscriptionModel,
  WebhookListItemModel,
  CreateWebhookModel,
  UpdateWebhookModel,
  type WebhookSubscriptionJson,
  type WebhookListItemJson,
  type WebhookDeliveryLogJson,
  type WebhookEventTypeJson,
  type WebhookTestResultJson,
  type WebhookDeliveryStatsJson,
  type WebhookAnalyticsJson,
  type WebhookHealthSummaryJson,
} from "../models/WebhookModel";
import type {
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from "../../domain/entities/WebhookRequests";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  isoDateString,
} from "@core/common/zod-utils";

// ─── Webhook Subscription Schema ──────────────────────────────────────────────────

const WebhookSubscriptionModelSchema = z.object({
  id: uuidField(),
  scope: optionalString(),
  tenantId: optionalString(),
  tenantName: optionalString(),
  url: z.string().url(),
  description: optionalString(),
  events: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  secret: optionalString(),
  hasPreviousSecret: z.boolean().optional().default(false),
  previousSecretExpiresAt: z.string().optional().nullable(),
  maxRetries: z.number().int().optional().nullable(),
  consecutiveFailures: z.number().int().optional().default(0),
  maxConsecutiveFailures: z.number().int().optional().nullable(),
  lastDeliveryAt: z.string().optional().nullable(),
  lastDeliveryStatus: z.string().optional().nullable(),
  totalDeliveries: z.number().int().optional().default(0),
  successfulDeliveries: z.number().int().optional().default(0),
  failedDeliveries: z.number().int().optional().default(0),
  successRate: z.number().optional().default(0),
  createdAt: isoDateString().optional(),
  modifiedAt: z.string().optional().nullable(),
});

const WebhookListItemModelSchema = z.object({
  id: uuidField(),
  scope: optionalString(),
  tenantName: optionalString(),
  url: z.string().url(),
  description: optionalString(),
  events: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  lastDeliveryAt: z.string().optional().nullable(),
  lastDeliveryStatus: z.string().optional().nullable(),
  successRate: z.number().optional().default(0),
  totalDeliveries: z.number().int().optional().default(0),
  successfulDeliveries: z.number().int().optional().default(0),
  failedDeliveries: z.number().int().optional().default(0),
});

export class WebhookMapper {
  /**
   * Convert WebhookSubscriptionModel → WebhookSubscription Entity
   */
  static toEntity(model: WebhookSubscriptionModel): WebhookSubscription {
    // Validate API response shape — logs warnings on contract drift
    const validated = safeParseApiResponse(
      WebhookSubscriptionModelSchema,
      model,
      "WebhookSubscription"
    );
    const data: WebhookSubscriptionData = {
      id: validated.id,
      scope: validated.scope ?? "",
      tenantId: validated.tenantId ?? null,
      tenantName: validated.tenantName ?? null,
      url: validated.url,
      description: validated.description ?? null,
      events: (validated.events as string[]) ?? [],
      isActive: validated.isActive,
      secret: validated.secret ?? "",
      hasPreviousSecret: validated.hasPreviousSecret,
      previousSecretExpiresAt: validated.previousSecretExpiresAt ?? null,
      maxRetries: validated.maxRetries ?? 3,
      consecutiveFailures: validated.consecutiveFailures,
      maxConsecutiveFailures: validated.maxConsecutiveFailures ?? 10,
      lastDeliveryAt: validated.lastDeliveryAt ?? null,
      lastDeliveryStatus: validated.lastDeliveryStatus ?? null,
      totalDeliveries: validated.totalDeliveries,
      successfulDeliveries: validated.successfulDeliveries,
      failedDeliveries: validated.failedDeliveries,
      successRate: validated.successRate,
      createdAt: validated.createdAt ?? "",
      modifiedAt: validated.modifiedAt ?? null,
    };
    return new WebhookSubscription(data);
  }

  /**
   * Convert raw subscription JSON → WebhookSubscription Entity
   * Shortcut: fromJson → toEntity
   */
  static fromJsonToEntity(json: WebhookSubscriptionJson): WebhookSubscription {
    const model = WebhookSubscriptionModel.fromJson(json);
    return WebhookMapper.toEntity(model);
  }

  /**
   * Convert WebhookListItemModel → WebhookSubscriptionListItem Entity
   */
  static toListItemEntity(model: WebhookListItemModel): WebhookSubscriptionListItem {
    // Validate API response shape — logs warnings on contract drift
    const validated = safeParseApiResponse(WebhookListItemModelSchema, model, "WebhookListItem");
    const data: WebhookSubscriptionListItemData = {
      id: validated.id,
      scope: validated.scope ?? "",
      tenantName: validated.tenantName ?? null,
      url: validated.url,
      description: validated.description ?? null,
      events: (validated.events as string[]) ?? [],
      isActive: validated.isActive,
      lastDeliveryAt: validated.lastDeliveryAt ?? null,
      lastDeliveryStatus: validated.lastDeliveryStatus ?? null,
      successRate: validated.successRate,
      totalDeliveries: validated.totalDeliveries,
      successfulDeliveries: validated.successfulDeliveries,
      failedDeliveries: validated.failedDeliveries,
    };
    return new WebhookSubscriptionListItem(data);
  }

  /**
   * Convert raw list item JSON → Entity
   */
  static fromListItemJsonToEntity(json: WebhookListItemJson): WebhookSubscriptionListItem {
    const model = WebhookListItemModel.fromJson(json);
    return WebhookMapper.toListItemEntity(model);
  }

  /**
   * Convert delivery log JSON → WebhookDeliveryLog Entity
   */
  static toDeliveryLogEntity(json: WebhookDeliveryLogJson): WebhookDeliveryLog {
    const data: WebhookDeliveryLogData = {
      id: json.id,
      eventDeliveryId: json.eventDeliveryId ?? "",
      eventType: json.eventType,
      payloadJson: json.payloadJson,
      requestUrl: json.requestUrl,
      requestHeaders: json.requestHeaders,
      httpStatusCode: json.httpStatusCode,
      responseBody: json.responseBody,
      errorMessage: json.errorMessage,
      status: (json.status as DeliveryStatus) ?? "Pending",
      nextRetryAt: json.nextRetryAt ?? null,
      maxAttempts: json.maxAttempts ?? 1,
      attemptNumber: json.attemptNumber,
      latencyMs: json.latencyMs,
      isSuccess: json.isSuccess,
      createdAt: json.createdAt,
    };
    return new WebhookDeliveryLog(data);
  }

  /**
   * Convert event type JSON → WebhookEventType Entity
   */
  static toEventTypeEntity(json: WebhookEventTypeJson): WebhookEventType {
    return new WebhookEventType(json.key, json.category, json.description);
  }

  /**
   * Convert test result JSON → WebhookTestResult Entity
   */
  static toTestResultEntity(json: WebhookTestResultJson): WebhookTestResult {
    return new WebhookTestResult(
      json.isSuccess,
      json.statusCode,
      json.latencyMs,
      json.responsePreview,
      json.errorMessage
    );
  }

  /**
   * Convert delivery stats JSON → WebhookDeliveryStats Entity
   */
  static toDeliveryStatsEntity(json: WebhookDeliveryStatsJson): WebhookDeliveryStats {
    return new WebhookDeliveryStats(
      json.totalDeliveries,
      json.successfulDeliveries,
      json.failedDeliveries,
      json.successRate,
      json.averageLatencyMs
    );
  }

  /**
   * Convert analytics JSON → WebhookAnalytics Entity
   */
  static toAnalyticsEntity(json: WebhookAnalyticsJson): WebhookAnalytics {
    return new WebhookAnalytics({
      successRate: json.successRate ?? 0,
      avgLatencyMs: json.avgLatencyMs ?? 0,
      p95LatencyMs: json.p95LatencyMs ?? 0,
      totalEvents: json.totalEvents ?? 0,
      deliveredEvents: json.deliveredEvents ?? 0,
      failedEvents: json.failedEvents ?? 0,
      deadLetteredCount: json.deadLetteredCount ?? 0,
      retryingCount: json.retryingCount ?? 0,
      dailyStats: json.dailyStats ?? [],
    });
  }

  /**
   * Convert health summary JSON → WebhookHealthSummary Entity
   */
  static toHealthSummaryEntity(json: WebhookHealthSummaryJson): WebhookHealthSummary {
    return new WebhookHealthSummary({
      activeEndpoints: json.activeEndpoints ?? 0,
      disabledEndpoints: json.disabledEndpoints ?? 0,
      autoDisabledEndpoints: json.autoDisabledEndpoints ?? 0,
      systemSuccessRate: json.systemSuccessRate ?? 0,
      last24hTotal: json.last24hTotal ?? 0,
      last24hDelivered: json.last24hDelivered ?? 0,
      last24hFailed: json.last24hFailed ?? 0,
      totalDeadLettered: json.totalDeadLettered ?? 0,
      totalRetrying: json.totalRetrying ?? 0,
      avgLatencyMs: json.avgLatencyMs ?? 0,
    });
  }

  /**
   * Map CreateWebhookRequest → CreateWebhookModel
   */
  static toCreateModel(request: CreateWebhookRequest): CreateWebhookModel {
    return new CreateWebhookModel(
      request.url,
      request.events,
      request.description,
      request.scope,
      request.maxRetries,
      request.maxConsecutiveFailures
    );
  }

  /**
   * Map UpdateWebhookRequest → UpdateWebhookModel
   */
  static toUpdateModel(request: UpdateWebhookRequest): UpdateWebhookModel {
    return new UpdateWebhookModel(
      request.url,
      request.description,
      request.events,
      request.scope,
      request.maxRetries,
      request.maxConsecutiveFailures
    );
  }
}
