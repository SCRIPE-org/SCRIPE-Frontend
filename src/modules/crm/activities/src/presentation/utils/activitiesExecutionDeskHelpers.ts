import type { ICrmActivityRepository } from "../../domain/interfaces/ICrmActivityRepository";
import type { CrmActivity, SalesActivityKind } from "../../domain/entities/CrmActivityEntity";

export interface ExecutionDeskAccountSummary {
  readonly id: string;
  readonly nameEn: string;
  readonly nameAr?: string | null;
  readonly commercialTierCode?: string | null;
  readonly preferredCurrencyCode?: string | null;
}

export interface ActivitiesState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmActivity[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

export async function fetchAggregatedActivities(
  repository: ICrmActivityRepository,
  accounts: ExecutionDeskAccountSummary[],
  activeKind: SalesActivityKind | undefined,
  searchTerm: string,
  pageToLoad: number,
  sizeToLoad: number
): Promise<{ items: CrmActivity[]; totalCount: number }> {
  // First attempt backend workspace-wide feed via includeAllVisible
  try {
    const res = await repository.getActivities({
      includeAllVisible: true,
      activityKind: activeKind,
      page: pageToLoad,
      pageSize: sizeToLoad,
    });
    if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
      let items = [...res.items];
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        items = items.filter(
          (a) =>
            a.summary.toLowerCase().includes(term) ||
            (a.bodyText && a.bodyText.toLowerCase().includes(term)) ||
            a.actorDisplaySnapshot.toLowerCase().includes(term)
        );
      }
      return { items, totalCount: searchTerm.trim() ? items.length : (res.totalCount ?? items.length) };
    }
  } catch {
    // Graceful fallback to client fan-out across accounts
  }

  if (accounts.length === 0) {
    return { items: [], totalCount: 0 };
  }

  const results = await Promise.all(
    accounts.slice(0, 5).map((acc) =>
      repository
        .getActivities({
          accountId: acc.id,
          activityKind: activeKind,
          page: 1,
          pageSize: 50,
        })
        .catch(() => ({ items: [], totalCount: 0, page: 1, pageSize: 50 }))
    )
  );

  let allItems: CrmActivity[] = results.flatMap((r) => r.items ?? []);
  const seen = new Set<string>();
  allItems = allItems.filter((item) => {
    if (seen.has(item.activityId)) return false;
    seen.add(item.activityId);
    return true;
  });

  allItems.sort(
    (a, b) => new Date(b.occurredAtUtc).getTime() - new Date(a.occurredAtUtc).getTime()
  );

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    allItems = allItems.filter(
      (a) =>
        a.summary.toLowerCase().includes(term) ||
        (a.bodyText && a.bodyText.toLowerCase().includes(term)) ||
        a.actorDisplaySnapshot.toLowerCase().includes(term)
    );
  }

  const startIndex = (pageToLoad - 1) * sizeToLoad;
  const pagedItems = allItems.slice(startIndex, startIndex + sizeToLoad);

  return { items: pagedItems, totalCount: allItems.length };
}

export async function executeCreateDeskActivity(
  repository: ICrmActivityRepository | undefined,
  selectedAccountId: string,
  accounts: ExecutionDeskAccountSummary[],
  data: {
    activityKind: SalesActivityKind;
    summary: string;
    bodyText?: string;
    containsPii?: boolean;
    occurredAtUtc?: string;
    accountId?: string;
  }
): Promise<void> {
  if (!repository) throw new Error("Activities repository not configured");
  const targetAccId =
    data.accountId || (selectedAccountId !== "all" ? selectedAccountId : accounts[0]?.id);
  await repository.createActivity({
    ...data,
    accountId: targetAccId,
    containsPii: data.containsPii ?? false,
  });
}

export async function executeCreateDeskFollowUp(
  repository: ICrmActivityRepository | undefined,
  activityId: string,
  data: { title: string; description?: string; assigneeUserId: string; dueAtUtc?: string }
): Promise<void> {
  if (!repository) throw new Error("Activities repository not configured");
  await repository.createFollowUp(activityId, data);
}

