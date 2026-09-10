/**
 * Dashboard Repository Interface
 *
 * Defines the contract for dashboard-specific data operations.
 * Slimmed down: audit and security methods moved to their own repos.
 */
import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
  EventTypeCount,
} from "../entities/DashboardEntities";

/**
 * Repository layer implementing client request queries for i dashboard.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IDashboardRepository {
  readonly exportEndpoint: string;
  getSummary(): Promise<DashboardSummary>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<RecentChange[]>;
  getEventDistribution(days?: number): Promise<EventTypeCount[]>;
}
