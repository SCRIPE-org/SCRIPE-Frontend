import type { IApiService } from "@/core/interfaces/api.interface";
import type {
  CrmEntitySearchItem,
  CrmEntitySearchRequest,
  CrmQuickCreateEntityInput,
} from "../../domain/models/crm-overview.types";
import { CRM_ENDPOINTS } from "./crm-overview.endpoints";

interface RawEnvelope<T> {
  data?: T;
  items?: T;
}

function unwrapResponse<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res && (res as RawEnvelope<T>).data !== undefined) {
    return (res as RawEnvelope<T>).data as T;
  }
  return res as T;
}

function extractList(res: unknown): Record<string, any>[] {
  const payload = unwrapResponse<unknown>(res);
  if (Array.isArray(payload)) {
    return payload as Record<string, any>[];
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as RawEnvelope<Record<string, any>[]>).items)) {
    return (payload as RawEnvelope<Record<string, any>[]>).items ?? [];
  }
  return [];
}

function mapAccountItem(raw: Record<string, any>): CrmEntitySearchItem | null {
  const id = String(raw.id ?? raw.accountId ?? "").trim();
  const label = String(raw.partyLegalNameEn ?? raw.organizationNameEn ?? raw.legalNameEn ?? raw.nameEn ?? "").trim();
  if (!id || !label) return null;
  const description = [raw.commercialTierCode, raw.preferredCurrencyCode, raw.email].filter(Boolean).join(" · ") || null;
  return {
    id,
    partyId: raw.partyId ? String(raw.partyId) : undefined,
    accountId: id,
    kind: "account",
    label,
    labelAr: raw.partyLegalNameAr ?? raw.organizationNameAr ?? raw.legalNameAr ?? null,
    description,
    isVerified: Boolean(raw.isVerified ?? true),
    email: raw.email ?? null,
    phone: raw.phone ?? null,
  };
}

function mapContactItem(raw: Record<string, any>): CrmEntitySearchItem | null {
  const id = String(raw.id ?? raw.contactId ?? "").trim();
  const label = String(raw.personLegalNameEn ?? raw.fullNameEn ?? raw.legalNameEn ?? raw.nameEn ?? "").trim();
  if (!id || !label) return null;
  const description =
    [raw.jobTitleSnapshot, raw.primaryAccountNameEn, raw.email || raw.phone].filter(Boolean).join(" · ") || null;
  return {
    id,
    partyId: raw.personPartyId ? String(raw.personPartyId) : raw.partyId ? String(raw.partyId) : undefined,
    contactId: id,
    accountId: raw.primaryAccountId ? String(raw.primaryAccountId) : undefined,
    kind: "contact",
    label,
    labelAr: raw.personLegalNameAr ?? raw.fullNameAr ?? raw.legalNameAr ?? null,
    description,
    isVerified: Boolean(raw.personPartyId ?? raw.partyId ?? raw.isVerified),
    email: raw.email ?? null,
    phone: raw.phone ?? null,
  };
}

function mapAssigneeItem(raw: Record<string, any>): CrmEntitySearchItem | null {
  const id = String(raw.id ?? raw.userId ?? raw.teamId ?? "").trim();
  const label = String(raw.displayName ?? raw.fullNameEn ?? raw.nameEn ?? raw.name ?? raw.email ?? "").trim();
  if (!id || !label) return null;
  const kind: "user" | "team" = String(raw.kind ?? "").toLowerCase() === "team" ? "team" : "user";
  const subtitle =
    raw.subtitle ?? ([raw.roleName || raw.role, raw.department || raw.teamName, raw.email].filter(Boolean).join(" · ") || null);
  return {
    id,
    kind,
    label,
    labelAr: raw.displayNameAr ?? raw.fullNameAr ?? raw.nameAr ?? null,
    description: subtitle ? String(subtitle) : null,
    email: raw.email ?? null,
  };
}

async function searchParties(api: IApiService, trimmedQuery: string, limit: number): Promise<CrmEntitySearchItem[]> {
  const params = new URLSearchParams();
  params.set("partyKind", "all");
  if (trimmedQuery) params.set("search", trimmedQuery);

  const partiesRes = await api.get<unknown>(`${CRM_ENDPOINTS.ACCOUNT_PARTIES}?${params.toString()}`);
  const items: CrmEntitySearchItem[] = [];
  const seen = new Set<string>();

  for (const raw of extractList(partiesRes)) {
    const partyId = String(raw.partyId ?? raw.id ?? "").trim();
    const label = String(raw.legalNameEn ?? raw.displayName ?? raw.nameEn ?? "").trim();
    if (!partyId || !label || seen.has(partyId)) continue;
    seen.add(partyId);
    const kindLabel = raw.partyKind === "Organization" ? "Organization" : raw.partyKind === "Person" ? "Person" : raw.partyKind;
    const description =
      raw.subtitle ||
      [kindLabel ? String(kindLabel) : null, raw.email, raw.phone].filter(Boolean).join(" · ") ||
      null;
    items.push({
      id: partyId,
      partyId,
      kind: "party",
      label,
      labelAr: raw.legalNameAr ?? null,
      description,
      isVerified: Boolean(raw.isVerified),
      email: raw.email ?? null,
      phone: raw.phone ?? null,
    });
    if (items.length >= limit) break;
  }

  return items;
}

/**
 * Executes server-backed entity or assignee lookups against live CRM API endpoints.
 */
export async function searchCrmEntities(api: IApiService, req: CrmEntitySearchRequest): Promise<CrmEntitySearchItem[]> {
  const limit = Math.min(Math.max(req.pageSize ?? 25, 1), 50);
  const trimmed = (req.query ?? "").trim();
  const q = trimmed ? `search=${encodeURIComponent(trimmed)}` : "";

  if (req.kind === "party") {
    return searchParties(api, trimmed, limit);
  }

  if (req.kind === "account") {
    const res = await api.get<unknown>(`${CRM_ENDPOINTS.ACCOUNTS}?page=1&pageSize=${limit}${q ? `&${q}` : ""}`);
    return extractList(res).map(mapAccountItem).filter((item): item is CrmEntitySearchItem => item !== null);
  }

  if (req.kind === "contact") {
    const accountFilter = req.accountId ? `&accountId=${encodeURIComponent(req.accountId)}` : "";
    const res = await api.get<unknown>(`${CRM_ENDPOINTS.CONTACTS}?page=1&pageSize=${limit}${q ? `&${q}` : ""}${accountFilter}`);
    return extractList(res).map(mapContactItem).filter((item): item is CrmEntitySearchItem => item !== null);
  }

  const assigneeKind = req.kind === "user" ? "user" : req.kind === "team" ? "team" : "all";
  try {
    const res = await api.get<unknown>(`${CRM_ENDPOINTS.SETTINGS_ASSIGNEES}?kind=${assigneeKind}&limit=${limit}${q ? `&${q}` : ""}`);
    return extractList(res).map(mapAssigneeItem).filter((item): item is CrmEntitySearchItem => item !== null);
  } catch {
    return [];
  }
}

/**
 * Inline quick-create helper for creating a tenant CRM account or contact without leaving a workflow dialog.
 */
export async function quickCreateCrmEntity(api: IApiService, input: CrmQuickCreateEntityInput): Promise<CrmEntitySearchItem> {
  const effectiveKind = input.kind === "party" ? (input.entitySubKind ?? "contact") : input.kind;
  const idempotencyKey = `crm-qc-${effectiveKind}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const config = {
    idempotencyKey,
    headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey },
  };

  if (effectiveKind === "account") {
    const res = await api.post<unknown>(CRM_ENDPOINTS.ACCOUNTS, {
      organizationNameEn: input.nameEn.trim(),
      organizationNameAr: input.nameAr?.trim() || undefined,
      email: input.email?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      commercialTierCode: input.commercialTierCode?.trim() || undefined,
    }, undefined, config);
    const created = unwrapResponse<Record<string, any>>(res);
    return mapAccountItem({
      ...created,
      email: created?.email ?? input.email,
      phone: created?.phone ?? input.phone,
    }) ?? {
      id: String(created?.id ?? ""),
      partyId: created?.partyId ? String(created.partyId) : undefined,
      accountId: created?.id ? String(created.id) : undefined,
      kind: "account",
      label: input.nameEn.trim(),
      labelAr: input.nameAr?.trim() || null,
      description: input.email?.trim() || null,
      isVerified: true,
    };
  }

  const res = await api.post<unknown>(CRM_ENDPOINTS.CONTACTS, {
    fullNameEn: input.nameEn.trim(),
    fullNameAr: input.nameAr?.trim() || undefined,
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    jobTitleSnapshot: input.jobTitle?.trim() || undefined,
    primaryAccountId: input.primaryAccountId?.trim() || undefined,
  }, undefined, config);
  const created = unwrapResponse<Record<string, any>>(res);
  return mapContactItem({
    ...created,
    jobTitleSnapshot: created?.jobTitleSnapshot ?? input.jobTitle,
    email: created?.email ?? input.email,
    phone: created?.phone ?? input.phone,
  }) ?? {
    id: String(created?.id ?? ""),
    partyId: created?.personPartyId ? String(created.personPartyId) : undefined,
    contactId: created?.id ? String(created.id) : undefined,
    kind: "contact",
    label: input.nameEn.trim(),
    labelAr: input.nameAr?.trim() || null,
    description: [input.jobTitle, input.email || input.phone].filter(Boolean).join(" · ") || null,
    isVerified: Boolean(created?.personPartyId),
  };
}
