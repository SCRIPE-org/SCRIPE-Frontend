// UI-EXCEPTION: compact studio layout
/**
 * Menu Customize View (Pure UI)
 *
 * Dedicated page for menu customization. Dual-tree layout:
 * - Left: Original base tree (with "customized" badges)
 * - Right: Effective preview tree (overrides applied, DnD)
 * - Below: Inline editing panel
 * - Bottom: Active overrides summary
 *
 * Separated from admin CRUD to provide a focused, premium customization UX.
 */
"use client";

import { useMenuCustomizeViewModel } from "../viewmodels/useMenuCustomizeViewModel";
import { CustomizePreviewTree } from "../components/CustomizePreviewTree";
import { OriginalTree } from "../components/OriginalTree";
import { CustomizePanel } from "../components/CustomizePanel";
import { ActiveOverridesList } from "../components/ActiveOverridesList";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Menu,
  User,
  Building2,
  FileText,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@core/common/utils";
import Link from "next/link";
import { MenuOverrideScope } from "../../domain/entities/MenuItemRequests";

/**
 * Presentation UI component rendering the menu customize view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function MenuCustomizeView() {
  const { t, direction } = useI18n();
  const vm = useMenuCustomizeViewModel();

  // "back" is directional (previous page), so it must mirror in RTL.
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <PageHeader
        className="mb-0"
        eyebrow={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customization/menus">
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Link>
          </Button>
        }
        title={t("menus.customizePage")}
        description={t("menus.customizePageDesc")}
        badges={
          vm.activeOverrides.length > 0 ? (
            <Badge variant="secondary">
              {vm.activeOverrides.length} {t("menus.activeOverridesCount")}
            </Badge>
          ) : undefined
        }
        actions={
          <>
            {/* Scope Tabs */}
            {vm.availableScopes.length > 1 && (
              <div className="inline-flex items-center gap-0.5 rounded-nx-control border border-nx-line bg-nx-surface p-0.5">
                {vm.availableScopes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => vm.setScope(s)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-nx-sm px-3 py-1.5 text-sm font-medium",
                      "transition-[color,background-color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                      "focus-visible:shadow-nx-focus focus-visible:outline-none",
                      vm.scope === s
                        ? "bg-nx-accent-fill text-nx-on-fill"
                        : "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
                    )}
                  >
                    {s === MenuOverrideScope.User ? (
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {s === MenuOverrideScope.User
                      ? t("menus.scopePersonal")
                      : t("menus.scopeOrganization")}
                  </button>
                ))}
              </div>
            )}

            {/* Reset All */}
            {vm.activeOverrides.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={vm.resetAllOverrides}
                loading={vm.isResettingAll}
                className="text-destructive hover:text-destructive"
              >
                {!vm.isResettingAll && (
                  <RotateCcw className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {t("menus.resetAll")}
              </Button>
            )}

            {/* Tree controls */}
            <Button variant="outline" size="sm" onClick={vm.expandAll}>
              <ChevronDown className="me-1 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.expandAll")}
            </Button>
            <Button variant="outline" size="sm" onClick={vm.collapseAll}>
              <ChevronRight className="me-1 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.collapseAll")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} loading={vm.isLoading}>
              {!vm.isLoading && (
                <RefreshCw className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {t("common.refresh")}
            </Button>
          </>
        }
      />

      {/* ── No Permission State ─────────────────────────────── */}
      {vm.availableScopes.length === 0 ? (
        <EmptyState
          size="lg"
          icon={ShieldAlert}
          title={t("menus.noPermission")}
          description={t("menus.noCustomizePermission")}
          action={
            <Button variant="outline" asChild>
              <Link href="/customization/menus">
                <BackIcon className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {t("menus.backToManagement")}
              </Link>
            </Button>
          }
        />
      ) : vm.isLoading ? (
        /* ── Loading State ────────────────────────────────── */
        <LoadingSpinner showText={false} />
      ) : vm.menuTree.length === 0 ? (
        /* ── Empty State ──────────────────────────────────── */
        <EmptyState
          size="lg"
          icon={Menu}
          title={t("menus.emptyTitle")}
          description={t("menus.noItemsToCustomize")}
          action={
            <Button variant="outline" asChild>
              <Link href="/customization/menus">
                <BackIcon className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {t("menus.backToManagement")}
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* ── Dual-Tree Comparison ────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Original Tree (base) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                  {t("menus.originalTree")}
                </CardTitle>
                <p className="text-xs text-nx-ink-3">{t("menus.originalTreeDesc")}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <OriginalTree
                  menuTree={vm.menuTree}
                  language={vm.language}
                  scope={vm.scope}
                  selectedItemId={vm.selectedItemId}
                  expandedNodes={vm.expandedOriginal}
                  onToggleExpand={vm.toggleExpandOriginal}
                  onSelectItem={vm.selectItem}
                />
              </CardContent>
            </Card>

            {/* Right: Effective Preview (overrides applied) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-success" aria-hidden="true" />
                  {t("menus.effectiveTree")}
                </CardTitle>
                <p className="text-xs text-nx-ink-3">{t("menus.effectiveTreeDesc")}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CustomizePreviewTree
                  effectiveTree={vm.effectiveTree}
                  language={vm.language}
                  selectedItemId={vm.selectedItemId}
                  expandedNodes={vm.expandedPreview}
                  onToggleExpand={vm.toggleExpandPreview}
                  onSelectItem={vm.selectItem}
                  // DnD
                  draggedNode={vm.draggedNode}
                  dropTarget={vm.dropTarget}
                  onDragStart={vm.handleDragStart}
                  onDragOver={vm.handleDragOver}
                  onDragLeave={vm.handleDragLeave}
                  onDragEnd={vm.handleDragEnd}
                  onDrop={vm.handleDrop}
                />

                {/* Root Drop Zone — visible only during drag */}
                {vm.draggedNode && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("border-nx-accent", "bg-nx-accent-wash");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("border-nx-accent", "bg-nx-accent-wash");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-nx-accent", "bg-nx-accent-wash");
                      vm.handleDropAtRoot();
                    }}
                    className="mt-3 flex items-center justify-center gap-2 rounded-nx-lg border-2 border-dashed border-nx-line p-4 text-sm text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none"
                  >
                    {t("menus.dropToRoot")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Edit Panel (full-width below trees) ─────── */}
          {vm.selectedNode && (
            <CustomizePanel
              selectedNode={vm.selectedNode}
              selectedOverride={vm.selectedOverride}
              formData={vm.formData}
              parentOptions={vm.parentOptions}
              language={vm.language}
              onSave={vm.saveOverride}
              isSaving={vm.isSaving}
            />
          )}

          {/* ── Active Overrides Summary ───────────────── */}
          <ActiveOverridesList
            overrides={vm.activeOverrides}
            language={vm.language}
            selectedItemId={vm.selectedItemId}
            onSelectItem={vm.selectItem}
            onRemoveOverride={vm.removeOverride}
            isDeleting={vm.isDeleting}
          />
        </>
      )}
    </div>
  );
}
