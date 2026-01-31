/**
 * Permission Repository Interface
 *
 * Defines the contract for permission data operations.
 */
import type { Permission } from "../entities/Permission";
import type {
      CreatePermissionRequest,
      UpdatePermissionRequest,
} from "../entities/PermissionRequests";

/**
 * Permission list query parameters
 */
export interface PermissionListParams {
      category?: string;
      search?: string;
}

/**
 * Permission repository interface
 */
export interface IPermissionRepository {
      /**
       * Get all permissions with optional filtering
       */
      getAll(params?: PermissionListParams): Promise<Permission[]>;

      /**
       * Get permission by ID
       */
      getById(id: string): Promise<Permission>;

      /**
       * Get all permission categories
       */
      getCategories(): Promise<string[]>;

      /**
       * Create a new permission
       */
      create(request: CreatePermissionRequest): Promise<string>;

      /**
       * Update an existing permission
       */
      update(id: string, request: UpdatePermissionRequest): Promise<void>;

      /**
       * Delete a permission
       */
      delete(id: string): Promise<void>;
}
