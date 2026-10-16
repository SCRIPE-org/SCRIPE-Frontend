/**
 * WorkItem Model (DTO)
 *
 * API data transfer object for WorkItem. Mapper converts Model <-> Entity.
 */

export interface WorkItemJson {
  id: string;
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  dueAt?: string | null;
  ownerEntityTypeKey?: string | null;
  ownerEntityId?: string | null;
  assignedToId?: string | null;
  completedAt?: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string | null;
}

/**
 * Documentation for module export
 */
export interface WorkItemListItemJson {
  id: string;
  title: string;
  status: number;
  priority: number;
  dueAt?: string | null;
  ownerEntityTypeKey?: string | null;
  assignedToId?: string | null;
  isActive: boolean;
  createdAt: string;
}

/**
 * Documentation for module export
 */
export interface WorkItemListResponseJson {
  items: WorkItemListItemJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Raw shape of one row from GET /api/v1/Admins (Identity module) -- the same
 * endpoint/shape the Leads module's assignable-admins picker consumes
 * (AssignableAdminResponseModel in leads.models.ts). Kept as a local copy
 * rather than a cross-module import: each module owns its own DTOs.
 */
export interface AssignableAdminResponseModel {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive: boolean;
  tenantId?: string;
  tenantName?: string;
  isSuperAdmin?: boolean;
}

/**
 * Documentation for module export
 */
export interface PagedAssignableAdminsModel {
  items: AssignableAdminResponseModel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Documentation for module export
 */
export class WorkItemModel {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly status: number,
    public readonly priority: number,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly description?: string | null,
    public readonly dueAt?: string | null,
    public readonly ownerEntityTypeKey?: string | null,
    public readonly ownerEntityId?: string | null,
    public readonly assignedToId?: string | null,
    public readonly completedAt?: string | null,
    public readonly modifiedAt?: string | null
  ) {}

  static fromJson(json: WorkItemJson): WorkItemModel {
    return new WorkItemModel(
      json.id,
      json.title,
      json.status,
      json.priority,
      json.isActive,
      json.createdAt,
      json.description,
      json.dueAt,
      json.ownerEntityTypeKey,
      json.ownerEntityId,
      json.assignedToId,
      json.completedAt,
      json.modifiedAt
    );
  }

  static fromListJson(json: WorkItemListItemJson): WorkItemModel {
    return new WorkItemModel(
      json.id,
      json.title,
      json.status,
      json.priority,
      json.isActive,
      json.createdAt,
      null,
      json.dueAt,
      json.ownerEntityTypeKey,
      null,
      json.assignedToId,
      null,
      null
    );
  }
}
