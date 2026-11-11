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
