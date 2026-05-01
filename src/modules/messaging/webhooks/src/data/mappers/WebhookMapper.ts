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

export class WebhookMapper {
  /**
   * Convert WebhookSubscriptionModel → WebhookSubscription Entity
   */
  static toEntity(model: WebhookSubscriptionModel): WebhookSubscription {
    const data: WebhookSubscriptionData = {
      id: model.id,
      scope: model.scope,
      tenantId: model.tenantId,
      tenantName: model.tenantName,
      url: model.url,
      description: model.description,
      events: model.events,
      isActive: model.isActive,
      secret: model.secret,
      hasPreviousSecret: model.hasPreviousSecret,
      previousSecretExpiresAt: model.previousSecretExpiresAt,
      maxRetries: model.maxRetries,
      consecutiveFailures: model.consecutiveFailures,
      maxConsecutiveFailures: model.maxConsecutiveFailures,
      lastDeliveryAt: model.lastDeliveryAt,
      lastDeliveryStatus: model.lastDeliveryStatus,
      totalDeliveries: model.totalDeliveries,
      successfulDeliveries: model.successfulDeliveries,
      failedDeliveries: model.failedDeliveries,
      successRate: model.successRate,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
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
    const data: WebhookSubscriptionListItemData = {
      id: model.id,
      scope: model.scope,
      tenantName: model.tenantName,
      url: model.url,
      description: model.description,
      events: model.events,
      isActive: model.isActive,
      lastDeliveryAt: model.lastDeliveryAt,
      lastDeliveryStatus: model.lastDeliveryStatus,
      successRate: model.successRate,
      totalDeliveries: model.totalDeliveries,
      successfulDeliveries: model.successfulDeliveries,
      failedDeliveries: model.failedDeliveries,
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
