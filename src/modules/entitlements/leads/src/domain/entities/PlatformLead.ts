/**
 * PlatformLead — Domain entity for the admin sales leads CRM.
 *
 * ARCHITECTURE NOTE:
 * Entities MUST NOT contain locale/display logic. Use raw keys and translate in the view.
 * relativeTime is a pure UTC helper — locale-neutral by design.
 */

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Closed";
export type LeadSource = "Website" | "Admin" | "Import";

// ── Pure UTC relative-time helper (locale-neutral) ────────────────────────────

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 30)
    return new Date(isoDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (minutes >= 1) return `${minutes}m ago`;
  return "just now";
}

// ── PlatformLeadListItem (lightweight, for table rows) ────────────────────────

export interface PlatformLeadListItemData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  status: LeadStatus;
  source: LeadSource;
  requestedAt: string;
  businessType?: string;
  teamSize?: string;
  primaryPriority?: string;
}

export class PlatformLeadListItem {
  constructor(public readonly data: PlatformLeadListItemData) {}

  get id(): string {
    return this.data.id;
  }
  get companyName(): string {
    return this.data.companyName;
  }
  get contactName(): string {
    return this.data.contactName;
  }
  get email(): string {
    return this.data.email;
  }
  get phone(): string | undefined {
    return this.data.phone;
  }
  get editionKey(): string | undefined {
    return this.data.editionKey;
  }
  get status(): LeadStatus {
    return this.data.status;
  }
  get source(): LeadSource {
    return this.data.source;
  }
  get requestedAt(): string {
    return this.data.requestedAt;
  }

  // Discovery intelligence
  get businessType(): string | undefined {
    return this.data.businessType;
  }
  get teamSize(): string | undefined {
    return this.data.teamSize;
  }
  get primaryPriority(): string | undefined {
    return this.data.primaryPriority;
  }

  // Computed
  get isNew(): boolean {
    return this.data.status === "New";
  }
  get isConverted(): boolean {
    return this.data.status === "Converted";
  }
  get relativeCreatedAt(): string {
    return relativeTime(this.data.requestedAt);
  }

  /** Raw i18n key for the source — view calls t(lead.sourceKey) */
  get sourceKey(): string {
    return `leads.source.${this.data.source}`;
  }

  /**
   * Returns raw locale key paths for discovery fields.
   * The view layer translates these via t(key).
   */
  get discoveryTagKeys(): Array<{ key: string; raw?: boolean }> {
    const keys: Array<{ key: string; raw?: boolean }> = [];
    if (this.data.businessType)
      keys.push({ key: `leads.discovery.industryLabels.${this.data.businessType}` });
    if (this.data.teamSize)
      keys.push({ key: `leads.discovery.teamSizeLabels.${this.data.teamSize}` });
    if (this.data.primaryPriority) keys.push({ key: this.data.primaryPriority, raw: true }); // raw string
    return keys;
  }

  copyWith(updates: Partial<PlatformLeadListItemData>): PlatformLeadListItem {
    return new PlatformLeadListItem({ ...this.data, ...updates });
  }
}

// ── PlatformLead (full detail, for drawer) ────────────────────────────────────

export interface PlatformLeadData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  message?: string;
  status: LeadStatus;
  source: LeadSource;
  requestedAt: string;
  updatedAt: string;
  convertedAt?: string;
  convertedToTenantId?: string;
  assignedToAdminId?: string;
  notes?: string;
  businessType?: string;
  teamSize?: string;
  primaryPriority?: string;
}

export class PlatformLead {
  constructor(public readonly data: PlatformLeadData) {}

  get id(): string {
    return this.data.id;
  }
  get companyName(): string {
    return this.data.companyName;
  }
  get contactName(): string {
    return this.data.contactName;
  }
  get email(): string {
    return this.data.email;
  }
  get phone(): string | undefined {
    return this.data.phone;
  }
  get editionKey(): string | undefined {
    return this.data.editionKey;
  }
  get message(): string | undefined {
    return this.data.message;
  }
  get status(): LeadStatus {
    return this.data.status;
  }
  get source(): LeadSource {
    return this.data.source;
  }
  get requestedAt(): string {
    return this.data.requestedAt;
  }
  get updatedAt(): string {
    return this.data.updatedAt;
  }
  get convertedAt(): string | undefined {
    return this.data.convertedAt;
  }
  get convertedToTenantId(): string | undefined {
    return this.data.convertedToTenantId;
  }
  get assignedToAdminId(): string | undefined {
    return this.data.assignedToAdminId;
  }
  get notes(): string | undefined {
    return this.data.notes;
  }
  get businessType(): string | undefined {
    return this.data.businessType;
  }
  get teamSize(): string | undefined {
    return this.data.teamSize;
  }
  get primaryPriority(): string | undefined {
    return this.data.primaryPriority;
  }

  // Computed
  get isNew(): boolean {
    return this.data.status === "New";
  }
  get isConverted(): boolean {
    return this.data.status === "Converted";
  }
  get isClosed(): boolean {
    return this.data.status === "Closed";
  }
  get relativeCreatedAt(): string {
    return relativeTime(this.data.requestedAt);
  }

  /**
   * Returns raw locale key paths for each discovery field present.
   * The view layer translates these via t(key).
   */
  get discoveryTagKeys(): {
    businessTypeKey?: string;
    teamSizeKey?: string;
    priority?: string; // raw string — no locale key for dynamic priority values
  } {
    return {
      businessTypeKey: this.data.businessType
        ? `leads.discovery.industryLabels.${this.data.businessType}`
        : undefined,
      teamSizeKey: this.data.teamSize
        ? `leads.discovery.teamSizeLabels.${this.data.teamSize}`
        : undefined,
      priority: this.data.primaryPriority,
    };
  }

  /** Raw i18n key for the source — view calls t(lead.sourceKey) */
  get sourceKey(): string {
    return `leads.source.${this.data.source}`;
  }

  copyWith(updates: Partial<PlatformLeadData>): PlatformLead {
    return new PlatformLead({ ...this.data, ...updates });
  }
}

// ── LeadActivity (activity timeline entry) ────────────────────────────────────

export type LeadActivityType =
  | "Submitted"
  | "StatusChanged"
  | "NoteAdded"
  | "Assigned"
  | "Converted"
  | "Closed";

export interface LeadActivity {
  id: string;
  leadId: string;
  type: LeadActivityType;
  summary: string;
  note?: string;
  fromStatus?: LeadStatus;
  toStatus?: LeadStatus;
  actorAdminId?: string;
  actorName?: string;
  occurredAt: string;
}
