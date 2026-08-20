/**
 * IFieldGroupRepository Interface
 *
 * Contract for field-group data access (Wave 5 row 5.2). Works with domain
 * entities, not DTOs.
 *
 * THE WRITE CONTRACT, in full, because two parts of it are easy to get wrong:
 *
 *  1. `update` accepts NO entityTypeKey and NO scope flag. Both are immutable
 *     after creation and the backend request record has no property for them.
 *
 *  2. `reorder` takes the FULL reordered set, not a single move. SortOrder is
 *     assigned directly from the payload, so the call is idempotent; and one
 *     invalid or inaccessible id fails the WHOLE request with nothing
 *     persisted. A tenant-scoped caller must therefore exclude global
 *     (platform-owned) groups from the payload -- the ownership guard rejects
 *     those, and taking one along would silently abort the entire reorder.
 */
import type { FieldGroup } from "../entities/FieldGroup";

export interface CreateFieldGroupInput {
  entityTypeKey: string;
  /** Immutable machine key, ^[a-z][a-z0-9_]*$. Absent from UpdateFieldGroupInput on purpose. */
  stableKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  isGlobal: boolean;
}

export interface UpdateFieldGroupInput {
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
}

export interface FieldGroupReorderItem {
  id: string;
  sortOrder: number;
}

export interface IFieldGroupRepository {
  getByEntityType(entityTypeKey: string): Promise<FieldGroup[]>;
  create(data: CreateFieldGroupInput): Promise<string>;
  update(id: string, data: UpdateFieldGroupInput): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(items: FieldGroupReorderItem[]): Promise<void>;
}
