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

export { NavigationService } from "./navigation.service";

export { NotificationService, type INotificationService } from "./notification.service";
