"use client";

import type {
  PlatformLead,
  PlatformLeadListItem,
  LeadStatus,
  LeadActivity,
  LeadCommunicationLog,
} from "../entities/PlatformLead";
import type { PagedResult } from "@core/interfaces/common.interface";

// ── Wizard Types (domain-level) ────────────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for edition for conversion.
 */
export interface EditionForConversion {
  id: string;
  name: string;
  displayNameEn: string;
  displayNameAr?: string;
  categoryKey?: string;
  isContactSalesOnly: boolean;
  monthlyPrice?: number;
  yearlyPrice?: number;
  defaultCurrency: string;
  featureCount: number;
  isFeatured: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for edition feature group.
 */
export interface EditionFeatureGroup {
  category: string;
  features: EditionFeatureItem[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for edition feature item.
 */
export interface EditionFeatureItem {
  featureId: string;
  featureName: string;
  displayNameEn: string;
  displayNameAr?: string;
  valueType: "Boolean" | "Numeric" | "String";
  editionValue: string;
  featureDefaultValue: string;
  description?: string;
  sortOrder: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for feature override.
 */
export interface FeatureOverride {
  featureId: string;
  value: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for status email preview.
 */
export interface StatusEmailPreview {
  subject: string;
  bodyHtml: string;
  bodyText: string;
  templateKey: string;
  recipientEmail: string;
  recipientName: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for leads list params.
 */
export interface LeadsListParams {
  page?: number;
  pageSize?: number;
  status?: LeadStatus;
  search?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for update lead status params.
 */
export interface UpdateLeadStatusParams {
  id: string;
  status: LeadStatus;
  notes?: string;
  /** When true, sends a notification email to the lead. Default: false. */
  sendNotification?: boolean;
  /** Optional override for the notification email subject. */
  emailSubjectOverride?: string;
  /** Optional HTML body override for the notification email. */
  emailBodyOverride?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for create lead params.
 */
export interface CreateLeadParams {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  message?: string;
  notes?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for convert lead params.
 */
export interface ConvertLeadParams {
  /** Encrypted edition ID. Null = resolve from lead's EditionKey. */
  editionId?: string;
  /** Tenant slug. Null = auto-generated. */
  tenantCode?: string;
  /** Admin email. Null = use lead email. */
  adminEmail?: string;
  /** Monthly | Yearly | Lifetime */
  subscriptionType?: string;
  /** Currency code, e.g. USD */
  currency?: string;
  /** Optional note logged on conversion. */
  conversionNote?: string;
  /**
   * Admin-negotiated custom deal price (enterprise / contact-sales deals).
   * When set, overrides the standard edition catalog price.
   * Null = use standard pricing.
   */
  negotiatedAmount?: number;
  /**
   * Currency for the negotiated amount.
   * Null = falls back to `currency` field.
   */
  negotiatedCurrency?: string;
  /**
   * Per-feature quota overrides set during the conversion wizard step 3.
   * Each entry overrides a specific feature value for this tenant only.
   */
  featureOverrides?: FeatureOverride[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for convert lead result.
 */
export interface ConvertLeadResult {
  tenantId: string;
  adminId: string;
  adminUsername: string;
  adminEmail: string;
  accountSetupUrl?: string;
  subscriptionId?: string;
  editionAssignmentError?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for assign lead params.
 */
export interface AssignLeadParams {
  /** Encrypted admin ID. Null = unassign. */
  adminId?: string;
  note?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for assignable admin.
 */
export interface AssignableAdmin {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  tenantName?: string;
  isPlatformAdmin: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for bulk lead status result.
 */
export interface BulkLeadStatusResult {
  updated: number;
  notFound: number;
  skipped: number;
  failedIds: string[];
}

/**
 * Repository layer implementing client request queries for i leads.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface ILeadsRepository {
  getAll(params: LeadsListParams): Promise<PagedResult<PlatformLeadListItem>>;
  getById(id: string): Promise<PlatformLead>;
  updateStatus(params: UpdateLeadStatusParams): Promise<void>;
  createLead(params: CreateLeadParams): Promise<string>; // returns new lead id
  convertToTenant(id: string, params: ConvertLeadParams): Promise<ConvertLeadResult>;
  assignLead(id: string, params: AssignLeadParams): Promise<void>;
  searchAssignableAdmins(search: string): Promise<AssignableAdmin[]>;
  deleteLead(id: string): Promise<void>;
  getActivity(id: string): Promise<LeadActivity[]>;
  /** Bulk-update status on multiple leads. Max 100 per call. */
  bulkUpdateStatus(
    leadIds: string[],
    status: string,
    notes?: string
  ): Promise<BulkLeadStatusResult>;
  /** Append a standalone CRM note to the lead's activity timeline. */
  addNote(id: string, note: string): Promise<void>;
  /** Send a one-off or template-based email to the lead. Returns the log entry ID. */
  sendEmail(
    leadId: string,
    subject: string,
    bodyHtml: string,
    templateKey?: string
  ): Promise<string>;
  /** Retrieve all sent-email communication logs for a lead. */
  getCommunicationLogs(leadId: string): Promise<LeadCommunicationLog[]>;
  /** Close a lead (CRM action). */
  closeLead(id: string, reason?: string): Promise<void>;
  /** Get editions available for the conversion wizard. */
  getEditionsForConversion(): Promise<EditionForConversion[]>;
  /** Get configurable feature groups for a specific edition. */
  getEditionFeaturesForConversion(editionId: string): Promise<EditionFeatureGroup[]>;
  /** Get a pre-built email template for a status transition. */
  getStatusEmailPreview(leadId: string, targetStatus: string): Promise<StatusEmailPreview>;
}
