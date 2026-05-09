/**
 * Core Services Barrel Export
 *
 * Centralized exports for all core services.
 * Helps with module resolution and prevents hot reload issues.
 *
 * @module core/services
 */

export { ApiService } from "./api.service";
export type { IApiService } from "@core/interfaces/api.interface";

export { PublicApiService } from "./public-api.service";
export type { IPublicApiService } from "@core/interfaces/public-api.interface";

export { NotificationService, type INotificationService } from "./notification.service";
