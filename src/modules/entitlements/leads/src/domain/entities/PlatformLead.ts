/**
 * PlatformLead — Domain entity for the admin sales leads CRM.
 */

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Closed";

export interface PlatformLeadData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  message?: string;
  status: LeadStatus;
  notes?: string;
  isDuplicate: boolean;
  convertedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export class PlatformLead {
  constructor(public readonly data: PlatformLeadData) {}

  get id(): string { return this.data.id; }
  get companyName(): string { return this.data.companyName; }
  get contactName(): string { return this.data.contactName; }
  get email(): string { return this.data.email; }
  get phone(): string | undefined { return this.data.phone; }
  get editionKey(): string | undefined { return this.data.editionKey; }
  get message(): string | undefined { return this.data.message; }
  get status(): LeadStatus { return this.data.status; }
  get notes(): string | undefined { return this.data.notes; }
  get isDuplicate(): boolean { return this.data.isDuplicate; }
  get convertedAt(): string | undefined { return this.data.convertedAt; }
  get createdAt(): string { return this.data.createdAt; }
  get updatedAt(): string | undefined { return this.data.updatedAt; }

  // ── Computed ──
  get isNew(): boolean { return this.data.status === "New"; }
  get isConverted(): boolean { return this.data.status === "Converted"; }
  get isClosed(): boolean { return this.data.status === "Closed"; }
  get displayStatus(): string { return this.data.status; }
  get hasPhone(): boolean { return !!this.data.phone; }
  get hasMessage(): boolean { !!this.data.message; return !!this.data.message; }

  copyWith(updates: Partial<PlatformLeadData>): PlatformLead {
    return new PlatformLead({ ...this.data, ...updates });
  }
}

// ── List Item ──

export interface PlatformLeadListItemData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  editionKey?: string;
  status: LeadStatus;
  createdAt: string;
}

export class PlatformLeadListItem {
  constructor(public readonly data: PlatformLeadListItemData) {}

  get id(): string { return this.data.id; }
  get companyName(): string { return this.data.companyName; }
  get contactName(): string { return this.data.contactName; }
  get email(): string { return this.data.email; }
  get editionKey(): string | undefined { return this.data.editionKey; }
  get status(): LeadStatus { return this.data.status; }
  get createdAt(): string { return this.data.createdAt; }

  get isNew(): boolean { return this.data.status === "New"; }
  get isConverted(): boolean { return this.data.status === "Converted"; }

  copyWith(updates: Partial<PlatformLeadListItemData>): PlatformLeadListItem {
    return new PlatformLeadListItem({ ...this.data, ...updates });
  }
}
