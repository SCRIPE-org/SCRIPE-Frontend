import type { CrmActivity } from "../../domain/entities/CrmActivityEntity";

export type ActivityDueBucket = "all" | "overdue" | "today" | "upcoming";

export interface ContactActivityFilterInfo {
  ids: string[];
  displayName: string | null;
  primaryAccountId: string | null;
}

/** Resolves party/account references for `?contact=` deep links cleanly. */
export async function resolveContactActivityFilter(
  getContactById: ((id: string) => Promise<{
    id: string;
    personPartyId?: string | null;
    primaryAccountId?: string | null;
    personLegalNameEn: string;
    personLegalNameAr?: string | null;
  }>) | undefined,
  contactId: string,
  isRtl: boolean
): Promise<ContactActivityFilterInfo> {
  if (!getContactById) {
    return { ids: [contactId], displayName: null, primaryAccountId: null };
  }
  try {
    const contact = await getContactById(contactId);
    const ids = [contact.id, contact.personPartyId].filter((v): v is string => Boolean(v));
    const displayName = (isRtl && contact.personLegalNameAr ? contact.personLegalNameAr : contact.personLegalNameEn) || null;
    return { ids: ids.length > 0 ? ids : [contactId], displayName, primaryAccountId: contact.primaryAccountId ?? null };
  } catch {
    return { ids: [contactId], displayName: null, primaryAccountId: null };
  }
}

/** Fetches activities for a specific commercial account with optional local search filtering. */
export async function fetchScopedAccountActivities(
  getActivities: (filter: {
    accountId: string;
    activityKind?: import("../../domain/entities/CrmActivityEntity").SalesActivityKind;
    page: number;
    pageSize: number;
  }) => Promise<{ items?: readonly CrmActivity[]; totalCount?: number; page?: number; pageSize?: number }>,
  accountId: string,
  activityKind: import("../../domain/entities/CrmActivityEntity").SalesActivityKind | undefined,
  searchTerm: string,
  pageToLoad: number,
  sizeToLoad: number
) {
  const res = await getActivities({ accountId, activityKind, page: pageToLoad, pageSize: sizeToLoad });
  let items = [...(res.items ?? [])];
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    items = items.filter(
      (a) =>
        a.summary.toLowerCase().includes(term) ||
        (a.bodyText && a.bodyText.toLowerCase().includes(term)) ||
        a.actorDisplaySnapshot.toLowerCase().includes(term)
    );
  }
  return {
    items,
    totalCount: searchTerm.trim() ? items.length : (res.totalCount ?? items.length),
    page: res.page ?? pageToLoad,
    pageSize: res.pageSize ?? sizeToLoad,
  };
}

/** Builds standardized pagination props for GenericCrudView. */
export function buildActivitiesPagination(
  page: number,
  pageSize: number,
  totalCount: number,
  onPageChange: (p: number) => void,
  onPageSizeChange: (s: number) => void
) {
  const pagesCount = Math.max(1, Math.ceil(totalCount / pageSize));
  return {
    page,
    currentPage: page,
    pageSize,
    itemsCount: totalCount,
    pagesCount,
    totalCount,
    totalPages: pagesCount,
    hasNextPage: page * pageSize < totalCount,
    hasPreviousPage: page > 1,
    onPageChange,
    onPageSizeChange,
  };
}

export interface ActivityWorkItemUpdatePayload {
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  dueAt?: string | null;
  assignedToId?: string | null;
  isActive?: boolean;
}

/** Returns true when a follow-up work item status represents terminal completion. */
export function isActivityWorkItemDone(status?: string | null): boolean {
  const normalized = (status || "").trim().toLowerCase();
  return (
    normalized === "done" ||
    normalized === "completed" ||
    normalized === "closed" ||
    normalized === "cancelled"
  );
}

/** Filters loaded CRM activities by contact identity and Odoo-style due buckets. */
export function filterActivitiesByDueAndContact(
  items: readonly CrmActivity[],
  dueBucket: ActivityDueBucket,
  contactFilterIds: readonly string[],
  completedActivityIds: Record<string, boolean>
): CrmActivity[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

  return items.filter((item) => {
    if (contactFilterIds.length > 0) {
      const partyMatch = item.partyId && contactFilterIds.includes(item.partyId);
      if (!partyMatch) return false;
    }

    if (dueBucket === "all") return true;

    const parsedDate = new Date(item.occurredAtUtc).getTime();
    if (Number.isNaN(parsedDate)) return false;

    const isDone =
      Boolean(completedActivityIds[item.activityId]) ||
      isActivityWorkItemDone(item.workItemStatus);
    const hasOpenTask =
      (Boolean(item.workItemStatus) || item.activityKind === "FollowUpLinked") && !isDone;

    if (dueBucket === "overdue") {
      return hasOpenTask && parsedDate < startOfToday;
    }
    if (dueBucket === "today") {
      return parsedDate >= startOfToday && parsedDate <= endOfToday;
    }
    if (dueBucket === "upcoming") {
      return parsedDate > endOfToday || (hasOpenTask && parsedDate >= startOfToday);
    }
    return true;
  });
}

/** Fetches and maps commercial accounts summary list for Activities Execution Desk. */
export async function fetchExecutionDeskAccounts(
  getAccounts: ((params: { page: number; pageSize: number }) => Promise<{
    items?: ReadonlyArray<{
      id: string;
      partyLegalNameEn: string;
      partyLegalNameAr?: string | null;
      commercialTierCode?: string | null;
      preferredCurrencyCode?: string | null;
    }>;
  }>) | undefined
) {
  if (!getAccounts) return [];
  const res = await getAccounts({ page: 1, pageSize: 50 });
  return (res.items ?? []).map((acc) => ({
    id: acc.id,
    nameEn: acc.partyLegalNameEn,
    nameAr: acc.partyLegalNameAr ?? null,
    commercialTierCode: acc.commercialTierCode ?? null,
    preferredCurrencyCode: acc.preferredCurrencyCode ?? null,
  }));
}
