"use client";

/**
 * PermissionProvenanceDetails
 *
 * Domain accordion list and "Why Granted?" provenance lineage explainer card
 * extracted from `PermissionProvenanceGraph`.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Shield,
} from "lucide-react";
import {
  KNOWN_DOMAIN_KEYS,
  type MappedPermissionItem,
  type PermissionDomainGroup,
} from "../utils/permission-provenance.utils";

interface PermissionDomainAccordionListProps {
  domainGroups: PermissionDomainGroup[];
  expandedDomains: Record<string, boolean>;
  inspectedCode: string | null;
  onToggleDomain: (domainKey: string) => void;
  onInspectCode: (code: string) => void;
}

/** Renders collapsible per-module PBAC permission groups and capability rows. */
export function PermissionDomainAccordionList({
  domainGroups,
  expandedDomains,
  inspectedCode,
  onToggleDomain,
  onInspectCode,
}: PermissionDomainAccordionListProps) {
  const { t } = useI18n();

  if (domainGroups.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-nx-line bg-nx-ground text-xs text-nx-ink-3 text-center">
        {t("profile.governance.noEffectivePermissions")}
      </div>
    );
  }

  return (
    <div className="space-y-2.5" data-testid="pbac-module-accordions">
      {domainGroups.map((group, index) => {
        const isExpanded = expandedDomains[group.key] ?? index === 0;
        const ModIcon = KNOWN_DOMAIN_KEYS[group.key]?.icon ?? Shield;

        return (
          <div
            key={group.key}
            data-testid={`pbac-module-group-${group.key}`}
            className="rounded-xl border border-nx-line bg-nx-ground overflow-hidden"
          >
            <Button
              type="button"
              variant="ghost"
              data-testid={`pbac-module-toggle-${group.key}`}
              onClick={() => onToggleDomain(group.key)}
              className="w-full flex items-center justify-between px-4 py-3 h-auto rounded-none hover:bg-nx-surface/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-nx-line bg-nx-surface text-nx-accent">
                  <ModIcon className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>
                <div className="text-start">
                  <span className="text-xs font-bold text-nx-ink block">{group.label}</span>
                  <span className="text-[11px] text-nx-ink-3">
                    {t("profile.governance.moduleCapabilityCount", { count: group.caps.length })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-success/15 text-success border border-success/30 text-[10px]">
                  {t("profile.governance.activeAccessBadge")}
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-nx-ink-3" style={{ minWidth: 16, minHeight: 16 }} />
                ) : (
                  <ChevronRight className="h-4 w-4 text-nx-ink-3" style={{ minWidth: 16, minHeight: 16 }} />
                )}
              </div>
            </Button>

            {isExpanded && (
              <div className="divide-y divide-nx-line border-t border-nx-line bg-nx-surface">
                {group.caps.map((cap) => {
                  const isInspected = inspectedCode === cap.code;
                  return (
                    <div
                      key={cap.code}
                      data-testid={`pbac-capability-row-${cap.code}`}
                      className={`p-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 transition-colors ${
                        isInspected ? "bg-nx-accent-wash/50" : ""
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold font-mono text-nx-ink break-all">
                            {cap.code}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              cap.accessLevel === "full"
                                ? "border-nx-accent/40 text-nx-accent text-[10px]"
                                : cap.accessLevel === "edit"
                                  ? "border-info/40 text-info text-[10px]"
                                  : "border-nx-line text-nx-ink-2 text-[10px]"
                            }
                          >
                            {t(`profile.governance.level.${cap.accessLevel}`)}
                          </Badge>
                          {cap.sourceDelegation && (
                            <Badge className="bg-warning/15 text-warning border border-warning/30 text-[10px]">
                              {cap.sourceDelegation}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className="border-nx-line bg-nx-ground text-nx-ink-2 text-[10px]"
                        >
                          {t("profile.governance.grantedViaLabel")}: {cap.grantedViaRole}
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant={isInspected ? "default" : "outline"}
                          data-testid={`why-granted-btn-${cap.code}`}
                          onClick={() => onInspectCode(cap.code)}
                          className={
                            isInspected
                              ? "h-7 text-[11px] bg-nx-accent-fill text-nx-on-fill font-semibold gap-1"
                              : "h-7 text-[11px] gap-1"
                          }
                        >
                          <HelpCircle className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
                          <span>{t("profile.governance.whyGrantedBtn")}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Explains how the selected permission capability was granted via Role, Branch, and Edition. */
export function PermissionProvenanceExplainerCard({
  inspectedCap,
}: {
  inspectedCap: MappedPermissionItem;
}) {
  const { t } = useI18n();

  return (
    <div
      data-testid="access-provenance-explanation-card"
      className="rounded-xl border border-nx-accent/30 bg-nx-ground p-4 space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" style={{ minWidth: 16, minHeight: 16 }} />
          <span className="text-xs font-bold text-nx-ink">
            {t("profile.governance.whyGrantedHeader")}: {inspectedCap.code}
          </span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] border-nx-line text-nx-ink-3">
          {inspectedCap.domainLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="rounded-lg border border-nx-line bg-nx-surface p-2.5">
          <span className="text-[10px] text-nx-ink-3 block">{t("profile.governance.nodeRole")}</span>
          <span className="font-semibold text-nx-ink">{inspectedCap.grantedViaRole}</span>
        </div>
        <div className="rounded-lg border border-nx-line bg-nx-surface p-2.5">
          <span className="text-[10px] text-nx-ink-3 block">{t("profile.governance.nodeBranchScope")}</span>
          <span className="font-semibold text-nx-ink">{inspectedCap.branchScope}</span>
        </div>
        <div className="rounded-lg border border-nx-line bg-nx-surface p-2.5">
          <span className="text-[10px] text-nx-ink-3 block">
            {t("profile.governance.nodeEditionEntitlement")}
          </span>
          <span className="font-semibold text-nx-accent">{inspectedCap.editionSource}</span>
        </div>
      </div>
    </div>
  );
}
