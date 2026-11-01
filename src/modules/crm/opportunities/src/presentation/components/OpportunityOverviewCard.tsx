"use client";

import { Card } from "@core/ui/card";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityStageBadge } from "./OpportunityStageBadge";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for OpportunityOverviewCard.
 */
export interface OpportunityOverviewCardProps {
  opp: CrmOpportunity;
}

/**
 * Header card presenting primary opportunity metrics, financial value, and verification status.
 */
export function OpportunityOverviewCard({ opp }: OpportunityOverviewCardProps) {
  const isOpen = opp.status === "Open";

  return (
    <Card className="p-6 border-nx-line bg-nx-surface">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-nx-ink">{opp.title}</h1>
            <OpportunityStatusBadge status={opp.status} />
          </div>
          <p className="text-xs text-nx-ink-3 font-mono">ID: {opp.id}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-end">
            <span className="text-xs text-nx-ink-3 block">Estimated Amount</span>
            <span className="text-xl font-bold text-nx-ink">
              {opp.maskedFieldKeys?.includes("estimatedAmount")
                ? "••••••"
                : opp.estimatedAmount != null
                ? `${opp.currencyCode} ${Number(opp.estimatedAmount).toLocaleString()}`
                : "—"}
            </span>
          </div>
          <div className="border-s border-nx-line ps-4">
            <span className="text-xs text-nx-ink-3 block">Stage</span>
            <OpportunityStageBadge
              stageKey={opp.stageKey}
              label={opp.stageLabelEnSnapshot}
              className="mt-0.5"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-nx-line text-xs">
        <div>
          <span className="text-nx-ink-3 block">Deal Type</span>
          <span className="font-semibold text-nx-ink">{opp.dealKind}</span>
        </div>
        <div>
          <span className="text-nx-ink-3 block">Party Verification (PD-1)</span>
          {opp.partyId ? (
            <span className="font-medium text-success flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> Verified Party Linked
            </span>
          ) : (
            <span className="font-medium text-warning flex items-center gap-1">
              <ShieldAlert className="size-3.5" /> Unlinked (Pre-proposal)
            </span>
          )}
        </div>
        <div>
          <span className="text-nx-ink-3 block">Target Close Date</span>
          <span className="font-medium text-nx-ink">
            {opp.targetCloseDate
              ? new Date(opp.targetCloseDate).toLocaleDateString()
              : "Not set"}
          </span>
        </div>
        <div>
          <span className="text-nx-ink-3 block">Created At</span>
          <span className="font-medium text-nx-ink">
            {new Date(opp.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {opp.directCreateRationale && (
        <div className="mt-4 p-3 rounded-nx-md bg-nx-surfaceSubtle text-xs border border-nx-line">
          <span className="text-nx-ink-3 font-semibold block mb-0.5">
            Direct Creation Rationale:
          </span>
          <p className="text-nx-ink-2">{opp.directCreateRationale}</p>
        </div>
      )}

      {!isOpen && (
        <div className="mt-4 p-3 rounded-nx-md bg-nx-surfaceSubtle text-xs border border-nx-line space-y-1">
          <span className="text-nx-ink-3 font-semibold block">Closure Summary:</span>
          <div className="flex gap-4 text-nx-ink-2">
            <span>Outcome: <strong>{opp.status}</strong></span>
            {opp.lossReasonCode && <span>Loss Reason: <strong>{opp.lossReasonCode}</strong></span>}
            {opp.competitorName && <span>Competitor: <strong>{opp.competitorName}</strong></span>}
            {opp.closedAtUtc && <span>Closed At: {new Date(opp.closedAtUtc).toLocaleString()}</span>}
          </div>
          {opp.closeNotes && <p className="text-nx-ink mt-1 italic">&ldquo;{opp.closeNotes}&rdquo;</p>}
        </div>
      )}
    </Card>
  );
}
