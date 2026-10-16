/**
 * WorkItem Entity
 *
 * Domain entity representing a generic work item (task).
 */

export interface WorkItemData {
  id: string;
  title: string;
  description?: string | null;
  status: number; // 0=Todo,1=InProgress,2=Blocked,3=Done,4=Cancelled
  priority: number; // 0=Low,1=Normal,2=High,3=Critical
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
export class WorkItem {
  constructor(public readonly data: WorkItemData) {}

  get id(): string {
    return this.data.id;
  }
  get title(): string {
    return this.data.title;
  }
  get description(): string | null | undefined {
    return this.data.description;
  }
  get status(): number {
    return this.data.status;
  }
  get priority(): number {
    return this.data.priority;
  }
  get dueAt(): string | null | undefined {
    return this.data.dueAt;
  }
  get ownerEntityTypeKey(): string | null | undefined {
    return this.data.ownerEntityTypeKey;
  }
  get ownerEntityId(): string | null | undefined {
    return this.data.ownerEntityId;
  }
  get assignedToId(): string | null | undefined {
    return this.data.assignedToId;
  }
  get completedAt(): string | null | undefined {
    return this.data.completedAt;
  }
  get isActive(): boolean {
    return this.data.isActive;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get modifiedAt(): string | null | undefined {
    return this.data.modifiedAt;
  }

  /**
   * Creates an immutable copy of the entity with updated work item data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new WorkItem instance with updated values.
   */
  copyWith(updates: Partial<WorkItemData>): WorkItem {
    return new WorkItem({ ...this.data, ...updates });
  }
}
