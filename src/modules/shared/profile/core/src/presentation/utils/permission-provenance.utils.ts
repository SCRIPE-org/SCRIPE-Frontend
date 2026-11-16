/**
 * Permission Provenance Pure Utilities
 *
 * Domain classification, capability suffix access-level inference, filtering,
 * and grouping helpers for `PermissionProvenanceGraph`.
 */
import {
  Briefcase,
  Building2,
  CreditCard,
  Lock,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";
import type { PermissionProvenanceNode } from "../../domain/entities/SovereignAccountEntities";

/** Derived privilege tier for a permission capability code. */
export type AccessLevel = "full" | "edit" | "view";

/** Enriched permission capability record displayed in the provenance graph. */
export interface MappedPermissionItem {
  code: string;
  domainKey: string;
  domainLabel: string;
  accessLevel: AccessLevel;
  grantedViaRole: string;
  branchScope: string;
  editionSource: string;
  sourceDelegation?: string;
}

/** Domain-grouped collection of mapped capabilities for accordion display. */
export interface PermissionDomainGroup {
  key: string;
  label: string;
  caps: MappedPermissionItem[];
}

/** Icon and localization key metadata for known SCRIPE permission domains. */
export const KNOWN_DOMAIN_KEYS: Record<
  string,
  { titleKey: string; icon: typeof Briefcase }
> = {
  crm: { titleKey: "profile.governance.module.crm", icon: Briefcase },
  venue: { titleKey: "profile.governance.module.venue", icon: Building2 },
  academy: { titleKey: "profile.governance.module.academy", icon: Users },
  hr: { titleKey: "profile.governance.module.hr", icon: Users },
  identity: { titleKey: "profile.governance.module.identity", icon: Lock },
  finance: { titleKey: "profile.governance.module.finance", icon: CreditCard },
  communication: { titleKey: "profile.governance.module.communication", icon: MessageSquare },
  platform: { titleKey: "profile.governance.module.platform", icon: Shield },
};

/** Infers whether a permission code grants full, edit, or read-only access. */
export function inferAccessLevel(permissionCode: string): AccessLevel {
  const lower = permissionCode.toLowerCase();
  if (
    lower.endsWith(".manage") ||
    lower.endsWith(".delete") ||
    lower.endsWith(".override") ||
    lower.endsWith(".admin") ||
    lower.endsWith(".execute") ||
    lower.endsWith(".approve") ||
    lower.endsWith(".grant") ||
    lower.endsWith(".lockdown")
  ) {
    return "full";
  }
  if (
    lower.endsWith(".write") ||
    lower.endsWith(".edit") ||
    lower.endsWith(".create") ||
    lower.endsWith(".update")
  ) {
    return "edit";
  }
  return "view";
}

/** Normalizes a raw domain string or permission prefix into a canonical module key. */
export function normalizeDomainKey(domain?: string, code?: string): string {
  const raw = (domain || code?.split(".")[0] || "platform").trim().toLowerCase();
  if (raw.includes("crm")) return "crm";
  if (raw.includes("venue") || raw.includes("facilit")) return "venue";
  if (raw.includes("academy")) return "academy";
  if (raw.includes("hr") || raw.includes("staff") || raw.includes("employee")) return "hr";
  if (raw.includes("ident") || raw.includes("auth") || raw.includes("security")) return "identity";
  if (raw.includes("fin") || raw.includes("bill") || raw.includes("pay")) return "finance";
  if (raw.includes("comm") || raw.includes("notif") || raw.includes("mail")) return "communication";
  if (raw.includes("plat") || raw.includes("tenant") || raw.includes("system")) return "platform";
  return raw;
}

/** Merges provenance nodes and raw effective permissions into enriched capability records. */
export function buildMappedPermissions(params: {
  provenanceGraph: PermissionProvenanceNode[];
  effectivePermissions: string[];
  roles: string[];
  activeBranch: string;
  editionName: string;
  isPlatformAdmin: boolean;
  t: (key: string) => string;
}): MappedPermissionItem[] {
  const {
    provenanceGraph,
    effectivePermissions,
    roles,
    activeBranch,
    editionName,
    isPlatformAdmin,
    t,
  } = params;

  const provenanceByCode = new Map<string, PermissionProvenanceNode>();
  for (const node of provenanceGraph) {
    if (node.permissionCode && !provenanceByCode.has(node.permissionCode)) {
      provenanceByCode.set(node.permissionCode, node);
    }
  }

  const allCodes = Array.from(
    new Set([
      ...provenanceGraph.map((n) => n.permissionCode).filter(Boolean),
      ...effectivePermissions.filter(Boolean),
    ])
  );

  return allCodes.map((code) => {
    const node = provenanceByCode.get(code);
    const domainKey = normalizeDomainKey(node?.domain, code);
    const meta = KNOWN_DOMAIN_KEYS[domainKey];
    const fallbackLabel = node?.domain?.trim() || domainKey.toUpperCase();
    return {
      code,
      domainKey,
      domainLabel: meta ? t(meta.titleKey) : fallbackLabel,
      accessLevel: inferAccessLevel(code),
      grantedViaRole:
        node?.grantingRole || roles[0] || t("profile.governance.assignedRoleFallback"),
      branchScope:
        node?.branchScope ||
        (isPlatformAdmin ? t("profile.rail.globalControlPlane") : activeBranch || "—"),
      editionSource:
        node?.editionSource ||
        editionName ||
        (isPlatformAdmin ? t("profile.rail.globalControlPlane") : "—"),
      sourceDelegation: node?.delegationSource ?? undefined,
    };
  });
}

/** Filters mapped permission capabilities by access level and search query. */
export function filterMappedPermissions(
  mappedCaps: MappedPermissionItem[],
  accessFilter: "all" | AccessLevel,
  searchQuery: string
): MappedPermissionItem[] {
  const q = searchQuery.trim().toLowerCase();
  return mappedCaps.filter((cap) => {
    if (accessFilter !== "all" && cap.accessLevel !== accessFilter) return false;
    if (!q) return true;
    return (
      cap.code.toLowerCase().includes(q) ||
      cap.domainLabel.toLowerCase().includes(q) ||
      cap.grantedViaRole.toLowerCase().includes(q) ||
      cap.branchScope.toLowerCase().includes(q) ||
      cap.editionSource.toLowerCase().includes(q)
    );
  });
}

/** Groups filtered capabilities into ordered domain accordion buckets. */
export function groupPermissionsByDomain(
  filteredCaps: MappedPermissionItem[]
): PermissionDomainGroup[] {
  const domainGroups: PermissionDomainGroup[] = [];
  const groupIndexByKey = new Map<string, number>();
  for (const cap of filteredCaps) {
    const existingIdx = groupIndexByKey.get(cap.domainKey);
    if (existingIdx === undefined) {
      groupIndexByKey.set(cap.domainKey, domainGroups.length);
      domainGroups.push({
        key: cap.domainKey,
        label: cap.domainLabel,
        caps: [cap],
      });
    } else {
      domainGroups[existingIdx].caps.push(cap);
    }
  }
  return domainGroups;
}
