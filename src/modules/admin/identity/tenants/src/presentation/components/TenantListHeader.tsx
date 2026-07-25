/**
 * TenantListHeader Component
 *
 * Page header for the tenants accordion view, composed on the shared
 * PageHeader anatomy: icon tile, title, description, a ruled meta strip of
 * the tree's status counts, an Add Tenant action, and a search field.
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { PageHeader, type PageHeaderMeta } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Building2, Plus, Search } from "lucide-react";
import type { TenantTreeNode } from "../../domain/entities/Tenant";

interface TenantListHeaderProps {
  tree: TenantTreeNode[];
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  canCreate: boolean;
}

interface TreeStats {
  total: number;
  active: number;
  suspended: number;
  canceled: number;
  expired: number;
}

function countTreeStats(
  nodes: TenantTreeNode[],
  acc: TreeStats = { total: 0, active: 0, suspended: 0, canceled: 0, expired: 0 }
): TreeStats {
  for (const node of nodes) {
    acc.total++;
    if (node.isSuspended && node.suspensionType === "Canceled") {
      acc.canceled++;
    } else if (node.isSuspended) {
      acc.suspended++;
    } else if (node.editionEndDate && new Date(node.editionEndDate) < new Date()) {
      acc.expired++;
    } else if (node.isActive) {
      acc.active++;
    }
    if (node.children?.length > 0) {
      countTreeStats(node.children, acc);
    }
  }
  return acc;
}

/**
 * Presentation UI component rendering the tenant list header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantListHeader({
  tree,
  search,
  onSearchChange,
  onAdd,
  canCreate,
}: TenantListHeaderProps) {
  const { t } = useI18n();

  const stats = React.useMemo(() => countTreeStats(tree), [tree]);

  const meta: PageHeaderMeta[] = [
    { label: t("tenant.totalTenants"), value: stats.total },
    { label: t("tenant.active"), value: stats.active },
    { label: t("tenant.suspended"), value: stats.suspended },
    { label: t("tenant.canceled"), value: stats.canceled },
    ...(stats.expired > 0 ? [{ label: t("tenant.expired"), value: stats.expired }] : []),
  ];

  return (
    <PageHeader
      icon={Building2}
      title={t("tenant.title")}
      description={t("tenant.description")}
      meta={meta}
      actions={
        canCreate ? (
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("tenant.addTenant")}
          </Button>
        ) : undefined
      }
    >
      {/* Search */}
      <div className="relative max-w-xs">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("tenant.searchPlaceholder")}
          aria-label={t("tenant.searchPlaceholder")}
          className="h-9 ps-9"
        />
      </div>
    </PageHeader>
  );
}
