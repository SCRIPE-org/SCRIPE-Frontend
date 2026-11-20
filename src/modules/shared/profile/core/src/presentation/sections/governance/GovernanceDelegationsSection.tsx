"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { SectionInfoPopover } from "../../components/SectionInfoPopover";
import { Clock, Plus, Trash2, UserCheck } from "lucide-react";

/**
 * Governance delegation record rendered in the time-bounded delegations ledger.
 */
export interface GovernanceDelegationItem {
  id: string;
  delegateAdminId: string;
  delegateDisplayName: string;
  delegateEmail: string;
  delegationType: string;
  grantedScopes: string[];
  delegatedPermissions: string[];
  startsAtUtc: string;
  expiresAtUtc: string;
  justification: string;
  reason: string;
  status: string;
}

function formatUtcTimestamp(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

/**
 * Props for GovernanceDelegationsSection.
 */
export interface GovernanceDelegationsSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  delegations: GovernanceDelegationItem[];
  delegationAllowed: boolean;
  isRevokingDelegation: boolean;
  onOpenGrantModal: () => void;
  onRequestRevoke: (item: GovernanceDelegationItem) => void;
}

/**
 * Full-width time-bounded delegation ledger displaying active grants, UTC windows,
 * granted scope badges, and Sudo-gated revocation buttons.
 */
export function GovernanceDelegationsSection({
  t,
  delegations,
  delegationAllowed,
  isRevokingDelegation,
  onOpenGrantModal,
  onRequestRevoke,
}: GovernanceDelegationsSectionProps) {
  return (
    <Card
      data-testid="governance-delegations-card"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.governance.delegationTitle")}
            </CardTitle>
            <SectionInfoPopover i18nPrefix="profile.infoPopover.timeBoundedDelegation" />
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-1">
            {t("profile.governance.delegationSubtitle")}
          </CardDescription>
        </div>

        <Button
          type="button"
          size="sm"
          data-testid="open-grant-delegation-modal-btn"
          disabled={!delegationAllowed}
          onClick={onOpenGrantModal}
          className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5 w-fit"
        >
          <Plus className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
          <span>{t("profile.governance.grantDelegationBtn")}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {!delegationAllowed && (
          <div className="p-3.5 rounded-xl border border-warning/30 bg-warning/10 text-xs text-warning">
            {t("profile.governance.delegationsUnavailableByPlan")}
          </div>
        )}

        {delegations.length === 0 ? (
          <p className="text-xs text-nx-ink-3 py-4 text-center rounded-xl border border-nx-line bg-nx-ground">
            {t("profile.governance.noDelegations")}
          </p>
        ) : (
          <div className="space-y-2.5">
            {delegations.map((del) => {
              const isActiveStatus = del.status.toLowerCase() === "active";
              return (
                <div
                  key={del.id}
                  data-testid={`delegation-row-${del.id}`}
                  className="p-4 rounded-xl border border-nx-line bg-nx-ground flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-nx-ink">
                        {del.delegateDisplayName || del.delegateEmail}
                      </span>
                      {del.delegateEmail &&
                        del.delegateEmail.trim() !== (del.delegateDisplayName ?? "").trim() && (
                          <span className="text-xs font-mono text-nx-ink-3" dir="ltr">
                            {del.delegateEmail}
                          </span>
                        )}
                      <Badge
                        className={
                          isActiveStatus
                            ? "bg-success/15 text-success border border-success/30 text-[10px]"
                            : "bg-nx-raised text-nx-ink-3 border border-nx-line text-[10px]"
                        }
                      >
                        {del.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-nx-line text-nx-ink-2">
                        {del.delegationType}
                      </Badge>
                    </div>

                    <p className="text-xs text-nx-ink-2">{del.justification}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-nx-ink-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
                        {formatUtcTimestamp(del.startsAtUtc)} &rarr; {formatUtcTimestamp(del.expiresAtUtc)}
                      </span>
                    </div>

                    {del.grantedScopes.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {del.grantedScopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="outline"
                            className="text-[10px] font-mono border-nx-line bg-nx-surface text-nx-ink-2"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {isActiveStatus && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`revoke-delegation-btn-${del.id}`}
                      disabled={isRevokingDelegation}
                      onClick={() => onRequestRevoke(del)}
                      className="h-8 text-xs font-semibold border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                      <span>{t("profile.governance.revokeDelegationBtn")}</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
