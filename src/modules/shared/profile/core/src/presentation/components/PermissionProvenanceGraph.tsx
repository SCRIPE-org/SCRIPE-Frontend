"use client";

/**
 * PermissionProvenanceGraph
 *
 * Backend-driven PBAC Capabilities & Access Provenance Matrix displaying
 * searchable domain capabilities and a "Why Granted?" lineage inspector.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Search, ShieldCheck } from "lucide-react";
import type { PermissionProvenanceNode } from "../../domain/entities/SovereignAccountEntities";
import { SectionInfoPopover } from "./SectionInfoPopover";
import {
  buildMappedPermissions,
  filterMappedPermissions,
  groupPermissionsByDomain,
  type AccessLevel,
} from "../utils/permission-provenance.utils";
import {
  PermissionDomainAccordionList,
  PermissionProvenanceExplainerCard,
} from "./PermissionProvenanceDetails";

/** Props accepted by `PermissionProvenanceGraph`. */
export interface PermissionProvenanceGraphProps {
  provenanceGraph?: PermissionProvenanceNode[];
  effectivePermissions?: string[];
  roles?: string[];
  activeBranch?: string;
  editionName?: string;
  isPlatformAdmin?: boolean;
}

const ACCESS_FILTER_OPTIONS = [
  { id: "all", labelKey: "profile.governance.filterAll" },
  { id: "full", labelKey: "profile.governance.filterFull" },
  { id: "edit", labelKey: "profile.governance.filterEdit" },
  { id: "view", labelKey: "profile.governance.filterView" },
] as const;

/** Interactive PBAC provenance explorer grouping effective account capabilities by domain. */
export function PermissionProvenanceGraph({
  provenanceGraph = [],
  effectivePermissions = [],
  roles = [],
  activeBranch = "",
  editionName = "",
  isPlatformAdmin = false,
}: PermissionProvenanceGraphProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState<"all" | AccessLevel>("all");
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const mappedCaps = buildMappedPermissions({
    provenanceGraph,
    effectivePermissions,
    roles,
    activeBranch,
    editionName,
    isPlatformAdmin,
    t,
  });
  const filteredCaps = filterMappedPermissions(mappedCaps, accessFilter, searchQuery);
  const domainGroups = groupPermissionsByDomain(filteredCaps);
  const inspectedCap =
    filteredCaps.find((c) => c.code === selectedCode) ??
    filteredCaps[0] ??
    mappedCaps[0] ??
    null;

  const toggleDomain = (domainKey: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainKey]: !(prev[domainKey] ?? domainGroups[0]?.key === domainKey),
    }));
  };

  return (
    <Card
      data-testid="permission-provenance-graph"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("profile.governance.matrixTitle")}
              </CardTitle>
              <SectionInfoPopover i18nPrefix="profile.infoPopover.rbacProvenance" />
            </div>
            <CardDescription className="text-xs text-nx-ink-2 mt-1">
              {t("profile.governance.matrixSubtitle")}
            </CardDescription>
          </div>
          <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-xs font-semibold w-fit">
            {t("profile.governance.showingCapabilitiesCount", {
              shown: filteredCaps.length,
              total: mappedCaps.length,
            })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              className="h-3.5 w-3.5 text-nx-ink-3 absolute start-3 top-1/2 -translate-y-1/2"
              style={{ minWidth: 14, minHeight: 14 }}
            />
            <Input
              data-testid="pbac-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("profile.governance.searchCapabilitiesPlaceholder")}
              className="ps-9 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ACCESS_FILTER_OPTIONS.map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                variant={accessFilter === f.id ? "default" : "outline"}
                data-testid={`pbac-filter-${f.id}`}
                onClick={() => setAccessFilter(f.id)}
                className={
                  accessFilter === f.id
                    ? "h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-semibold"
                    : "h-8 text-xs"
                }
              >
                {t(f.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <PermissionDomainAccordionList
          domainGroups={domainGroups}
          expandedDomains={expandedDomains}
          inspectedCode={inspectedCap?.code ?? null}
          onToggleDomain={toggleDomain}
          onInspectCode={setSelectedCode}
        />

        {inspectedCap && <PermissionProvenanceExplainerCard inspectedCap={inspectedCap} />}
      </CardContent>
    </Card>
  );
}
