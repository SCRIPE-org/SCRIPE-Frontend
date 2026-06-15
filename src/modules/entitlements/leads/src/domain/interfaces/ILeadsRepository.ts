"use client";

import type {
  PlatformLead,
  PlatformLeadListItem,
  LeadStatus,
  LeadActivity,
} from "../entities/PlatformLead";
import type { PagedResult } from "@modules/identity/core/domain/types";

export interface LeadsListParams {
  page?: number;
  pageSize?: number;
  status?: LeadStatus;
  search?: string;
}

export interface UpdateLeadStatusParams {
  id: string;
  status: LeadStatus;
  notes?: string;
}

export interface CreateLeadParams {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  message?: string;
  notes?: string;
}

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
}

export interface ConvertLeadResult {
  tenantId: string;
  adminId: string;
  adminUsername: string;
  adminEmail: string;
  accountSetupUrl?: string;
  subscriptionId?: string;
  editionAssignmentError?: string;
}

export interface AssignLeadParams {
  /** Encrypted admin ID. Null = unassign. */
  adminId?: string;
  note?: string;
}

export interface AssignableAdmin {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  tenantName?: string;
  isPlatformAdmin: boolean;
}

export interface BulkLeadStatusResult {
  updated: number;
  notFound: number;
  skipped: number;
  failedIds: string[];
}

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
}
