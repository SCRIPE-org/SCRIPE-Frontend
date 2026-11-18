"use client";

import type { EvaluatedWorkflowTransition } from "@modules/crm";

export interface MoveStageApprovalGateCardProps {
  t: (key: string) => string;
  evalTransition: EvaluatedWorkflowTransition | null | undefined;
}

/** Displays the active pipeline role approval gate summary inside MoveStageDialog. */
export function MoveStageApprovalGateCard({ t, evalTransition }: MoveStageApprovalGateCardProps) {
  return (
    <div
      className="rounded-lg border border-nx-line bg-nx-raised/40 px-3 py-2 flex items-center justify-between gap-2 text-xs"
      data-testid="move-stage-approval-gate-card"
    >
      <span className="font-semibold text-nx-ink">
        {t("crmOpportunities.commercialSuite.pipelineRoleGateLabel")}
      </span>
      <span className="font-mono text-[11px] text-nx-ink-2">
        {evalTransition?.approvalRequirement?.required
          ? `${evalTransition.approvalRequirement.roles.join(", ")} (${evalTransition.approvalRequirement.quorum})`
          : t("crmOpportunities.commercialSuite.authorizedViaActiveRole")}
      </span>
    </div>
  );
}
