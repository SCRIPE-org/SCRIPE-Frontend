/**
 * AuditLogEntry Entity
 *
 * Domain entity for a single audit log record.
 * Pure business logic — no API/JSON concerns.
 *
 * @module customization/domain
 */

import { formatDateTimeUtc } from "@core/common/utils";

/**
 * Documentation for module export
 */
export interface AuditLogEntryProps {
  versionNumber: number;
  changeType: string;
  changedByAdminName: string | null;
  changedAt: string;
}

/**
 * AuditLogEntry domain entity
 */
export class AuditLogEntry {
  private readonly props: AuditLogEntryProps;

  constructor(props: AuditLogEntryProps) {
    this.props = props;
  }

  get versionNumber(): number {
    return this.props.versionNumber;
  }
  get changeType(): string {
    return this.props.changeType;
  }
  get changedByAdminName(): string | null {
    return this.props.changedByAdminName;
  }
  get changedAt(): string {
    return this.props.changedAt;
  }

  // ===== Business Logic =====

  /** Whether the change was a publish */
  get isPublish(): boolean {
    return this.props.changeType === "publish";
  }

  /** Whether the change was a rollback */
  get isRollback(): boolean {
    return this.props.changeType === "rollback";
  }

  /** Whether the change was a draft discard */
  get isDraftDiscard(): boolean {
    return this.props.changeType === "draft-discard";
  }

  /** Get formatted date string */
  get formattedDate(): string {
    return formatDateTimeUtc(this.props.changedAt);
  }

  /** Get raw props */
  toProps(): AuditLogEntryProps {
    return { ...this.props };
  }

  copyWith(updates: Partial<AuditLogEntryProps>): AuditLogEntry {
    return new AuditLogEntry({
      ...this.props,
      ...updates,
    } as AuditLogEntryProps);
  }
}
