"use client";

import { Card } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { ActivityTimeline } from "@modules/crm";
import type { CrmOpportunity, CrmOpportunityStageHistory, DealContactRole } from "../../domain/entities/OpportunityEntity";
import { OpportunityAuditTimeline } from "./OpportunityAuditTimeline";
import { OpportunityCommercialAndCommitteeSection } from "./OpportunityCommercialAndCommitteeSection";
import { OpportunityCommercialQuoteAndPlaybookSection } from "./OpportunityCommercialQuoteAndPlaybookSection";
import { OpportunityHqFulfillmentHandoffCard } from "./OpportunityHqFulfillmentHandoffCard";

/** Props for `OpportunityDetailTabsSection`. */
export interface OpportunityDetailTabsSectionProps {
  readonly t: (key: string, params?: Record<string, string | number>) => string;
  readonly isRtl: boolean;
  readonly opp: CrmOpportunity;
  readonly stageHistory: CrmOpportunityStageHistory[];
  readonly contactRoles: DealContactRole[];
  readonly fulfillmentRequested: boolean;
  readonly isRequestingFulfillment: boolean;
  readonly submitError: string | null;
  readonly onRequestFulfillmentHandoff: () => void;
  readonly onAddContactRole: (input: {
    contactPartyId: string;
    contactName: string;
    stakeholderRole: DealContactRole["stakeholderRole"];
    isPrimary: boolean;
    influenceNotes?: string;
  }) => Promise<void>;
  readonly onRemoveContactRole: (roleId: string) => Promise<void>;
}

/** Tabbed workspace inside Deal 360 uniting Playbook, Commercial Quote & Committee, and Activity Audit. */
export function OpportunityDetailTabsSection({
  t, isRtl, opp, stageHistory, contactRoles, fulfillmentRequested, isRequestingFulfillment, submitError,
  onRequestFulfillmentHandoff, onAddContactRole, onRemoveContactRole,
}: OpportunityDetailTabsSectionProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="bg-nx-surface border border-nx-line p-1">
        <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">
          {t("crmOpportunities.tabs.overview")}
        </TabsTrigger>
        <TabsTrigger value="commercial" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">
          {t("crmOpportunities.tabs.commercial")}
        </TabsTrigger>
        <TabsTrigger value="activity" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">
          {t("crmOpportunities.tabs.activity")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" forceMount className="space-y-4 data-[state=inactive]:hidden">
        <OpportunityCommercialQuoteAndPlaybookSection opp={opp} isRtl={isRtl} mode="playbook" />
        <OpportunityHqFulfillmentHandoffCard
          t={t}
          opp={opp}
          fulfillmentRequested={fulfillmentRequested}
          isRequestingFulfillment={isRequestingFulfillment}
          onRequestFulfillmentHandoff={onRequestFulfillmentHandoff}
        />
      </TabsContent>

      <TabsContent value="commercial" forceMount className="space-y-4 data-[state=inactive]:hidden">
        <OpportunityCommercialAndCommitteeSection
          opp={opp}
          isRtl={isRtl}
          stageHistory={stageHistory}
          contactRoles={contactRoles}
          onAddContactRole={onAddContactRole}
          onRemoveContactRole={onRemoveContactRole}
          submitError={submitError}
        />
      </TabsContent>

      <TabsContent value="activity" forceMount className="space-y-4 data-[state=inactive]:hidden">
        <Card className="p-5 border-nx-line bg-nx-surface">
          <ActivityTimeline key={`${opp.id}-${opp.rowVersion || ""}`} opportunityId={opp.id} targetLabel={opp.title} />
        </Card>
        <OpportunityAuditTimeline stageHistory={stageHistory} isRtl={isRtl} />
      </TabsContent>
    </Tabs>
  );
}
