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
import {
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Menu,
  User,
  Building2,
  Loader2,
  FileText,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@core/common/utils";
import Link from "next/link";
import { MenuOverrideScope } from "../../domain/entities/MenuItemRequests";

export function MenuCustomizeView() {
  const { t } = useI18n();
  const vm = useMenuCustomizeViewModel();

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/customization/menus">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("menus.customizePage")}</h1>
            <p className="text-sm text-muted-foreground">{t("menus.customizePageDesc")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Tabs */}
          {vm.availableScopes.length > 1 && (
            <div className="inline-flex items-center rounded-lg border bg-background p-0.5">
              {vm.availableScopes.map((s) => (
                <button
                  key={s}
                  onClick={() => vm.setScope(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                    "transition-all duration-200",
                    vm.scope === s
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {s === MenuOverrideScope.User ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Building2 className="h-3.5 w-3.5" />
                  )}
                  {s === MenuOverrideScope.User
                    ? t("menus.scopePersonal")
                    : t("menus.scopeOrganization")}
                </button>
              ))}
            </div>
          )}

          {/* Active overrides count */}
          {vm.activeOverrides.length > 0 && (
            <Badge variant="secondary">
              {vm.activeOverrides.length} {t("menus.activeOverridesCount") || "customizations"}
            </Badge>
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
              {!vm.isResettingAll && <RotateCcw className="mr-1.5 h-4 w-4" />}
              {t("menus.resetAll") || "Reset All"}
            </Button>
          )}

          {/* Tree controls */}
          <Button variant="outline" size="sm" onClick={vm.expandAll}>
            <ChevronDown className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
            {t("common.expandAll") ?? "Expand All"}
          </Button>
          <Button variant="outline" size="sm" onClick={vm.collapseAll}>
            <ChevronRight className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
            {t("common.collapseAll") ?? "Collapse All"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => vm.refetch()}
            disabled={vm.isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", vm.isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* ── No Permission State ─────────────────────────────── */}
      {vm.availableScopes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              {t("menus.noPermission") ?? "No Permission"}
            </h3>
            <p className="mb-4 max-w-sm text-center text-muted-foreground">
              {t("menus.noCustomizePermission") ?? "You do not have permission to customize menus."}
            </p>
            <Button variant="outline" asChild>
              <Link href="/customization/menus">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {t("menus.backToManagement")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : vm.isLoading ? (
        /* ── Loading State ────────────────────────────────── */
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            </div>
          </CardContent>
        </Card>
      ) : vm.menuTree.length === 0 ? (
        /* ── Empty State ──────────────────────────────────── */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Menu className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("menus.emptyTitle")}</h3>
            <p className="mb-4 max-w-sm text-center text-muted-foreground">
              {t("menus.noItemsToCustomize")}
            </p>
            <Button variant="outline" asChild>
              <Link href="/customization/menus">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {t("menus.backToManagement")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Dual-Tree Comparison ────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Original Tree (base) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {t("menus.originalTree") ?? "Original Menu"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t("menus.originalTreeDesc") ??
                    "Base menu structure — items with overrides are marked"}
                </p>
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
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  {t("menus.effectiveTree") ?? "Effective Preview"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t("menus.effectiveTreeDesc") ??
                    "Menu after all customizations — drag to reorder"}
                </p>
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
                      e.currentTarget.classList.add("border-primary", "bg-primary/5");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("border-primary", "bg-primary/5");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-primary", "bg-primary/5");
                      vm.handleDropAtRoot();
                    }}
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-sm text-muted-foreground transition-colors"
                  >
                    {t("menus.dropToRoot") ?? "Drop here to move to root level"}
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
