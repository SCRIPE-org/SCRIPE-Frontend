import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

export interface KanbanSwimlaneGroup {
  key: string;
  label: string;
  deals: CrmOpportunity[];
  dealIds: Set<string>;
}

/** Groups deals into horizontal Kanban swimlanes by assignee, account, or dealType. */
export function buildKanbanSwimlaneGroups(
  opportunities: CrmOpportunity[],
  swimlaneMode: string,
  t: (key: string) => string,
): KanbanSwimlaneGroup[] {
  if (swimlaneMode === "none") return [];
  const map = new Map<string, KanbanSwimlaneGroup>();
  for (const opp of opportunities) {
    let key = "default";
    let label = t("crmOpportunities.kanban.swimlaneGeneral");
    if (swimlaneMode === "assignee") {
      key = opp.ownerUserId || "unassigned";
      label = opp.ownerUserId
        ? `${t("crmOpportunities.kanban.swimlaneOwnerPrefix")} ${opp.ownerDisplayName || t("crmOpportunities.kanban.assignedOwnerFallback")}`
        : t("crmOpportunities.kanban.swimlaneUnassigned");
    } else if (swimlaneMode === "account") {
      key = opp.accountId || opp.partyId || "unlinked";
      const customerName = opp.accountDisplayName || opp.partyDisplayName || opp.primaryContactName;
      label = opp.accountId
        ? `${t("crmOpportunities.kanban.swimlaneAccountPrefix")} ${customerName || t("crmOpportunities.kanban.linkedPartyFallback")}`
        : opp.partyId
          ? `${t("crmOpportunities.kanban.swimlanePartyPrefix")} ${customerName || t("crmOpportunities.kanban.linkedPartyFallback")}`
          : t("crmOpportunities.kanban.swimlaneUnlinkedAccount");
    } else if (swimlaneMode === "dealType") {
      key = `${opp.dealKind || "NewBusiness"}-${opp.currencyCode || "SAR"}`;
      label = `${opp.dealKind || "NewBusiness"} • ${opp.currencyCode || "SAR"}`;
    }
    const existing = map.get(key);
    if (existing) {
      existing.deals.push(opp);
      existing.dealIds.add(opp.id);
    } else {
      map.set(key, { key, label, deals: [opp], dealIds: new Set([opp.id]) });
    }
  }
  return Array.from(map.values());
}
