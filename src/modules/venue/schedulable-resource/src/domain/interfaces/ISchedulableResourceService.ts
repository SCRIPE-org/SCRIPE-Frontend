import type { SchedulableResourceModel } from "../../data/models/SchedulableResourceModel";
import type { PublicationChecklistReport } from "../entities/SchedulableResource";

/**
 * Documentation for module export
 */
export interface SchedulableResourceListResult {
  items: SchedulableResourceModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Documentation for module export
 */
export interface ISchedulableResourceService {
  getAll(params: { page: number; pageSize: number; search?: string; facilityResourceProfileIds?: string[] }): Promise<SchedulableResourceListResult>;
  getById(id: string): Promise<SchedulableResourceModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
  getPublicationChecklist(id: string): Promise<PublicationChecklistReport>;
  publish(id: string): Promise<void>;
}
