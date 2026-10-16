/* eslint-disable unused-imports/no-unused-vars */
// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * Menus View (Pure UI) — Admin Management
 *
 * Composes all menu-tree components with native HTML5 DnD.
 * Now includes workspace filter tabs and a workspace management slide-out panel.
 *
 * Workspace filter tabs: shows one tab per workspace + "All" tab.
 * Clicking a tab filters the menu tree to show only items belonging to that workspace.
 *
 * Override customization is on a separate page: /customization/menus/customize
 */
"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useMenusViewModel } from "../viewmodels/useMenusViewModel";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ScrollArea, ScrollBar } from "@core/ui/scroll-area";
import { PageHeader } from "@core/ui/page-header";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { SectionState } from "@core/ui/section-state";

import { MenuTreeItem } from "../components/MenuTreeItem";
import { MenuFormDialog } from "../components/MenuFormDialog";
import { DeleteMenuDialog } from "../components/DeleteMenuDialog";
import {
  Plus,
  Menu,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  ArrowDownToLine,
  Palette,
  Layers,
  Grid3X3,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { cn } from "@core/common/utils";
import Link from "next/link";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type { WorkspaceGroup } from "@core/navigation";

/** Filter menu tree to only nodes belonging to a workspace (by workspaceId) */
function filterByWorkspace(nodes: MenuTreeNode[], workspaceId: string | null): MenuTreeNode[] {
  if (!workspaceId) return nodes;

  const filterRecursive = (items: MenuTreeNode[]): MenuTreeNode[] =>
    items.reduce<MenuTreeNode[]>((acc, node) => {
      const filteredChildren = filterRecursive(node.children);
      const matches = node.workspaceId === workspaceId;
      if (matches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);

  return filterRecursive(nodes);
}

/**
 * Presentation UI component rendering the menus view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function MenusView() {
  useModuleLocales(() => import("../../../locales"), "menus");

  const { t, language } = useI18n();
  const vm = useMenusViewModel();
  const { workspaceGroups, activeWorkspace } = useWorkspace();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Workspace filter state ─────────────────────────────────────────
  // null = "All workspaces" tab active
  const [filterWorkspaceId, setFilterWorkspaceId] = useState<string | null>(null);

  // Filtered tree based on active workspace tab
  const filteredTree = filterByWorkspace(vm.menuTree, filterWorkspaceId);

  // Count per workspace for badge
  const menuTree = vm.menuTree;
  const workspaceCounts = useCallback(
    (workspaceId: string) => {
      const countRecursive = (nodes: MenuTreeNode[]): number =>
        nodes.reduce(
          (sum, n) => sum + (n.workspaceId === workspaceId ? 1 : 0) + countRecursive(n.children),
          0
        );
      return countRecursive(menuTree);
    },
    [menuTree]
  );

  // ── Auto-scroll when dragging near edges ───────────────────────────
  const draggedNode = vm.draggedNode;
  useEffect(() => {
    if (!draggedNode) return;

    const handleGlobalDragOver = (e: DragEvent) => {
      const scrollThreshold = 80;
      const scrollSpeed = 12;
      const mouseY = e.clientY;
      const viewportHeight = window.innerHeight;

      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }

      if (mouseY < scrollThreshold) {
        scrollIntervalRef.current = setInterval(() => {
          window.scrollBy(0, -scrollSpeed);
        }, 16);
      } else if (mouseY > viewportHeight - scrollThreshold) {
        scrollIntervalRef.current = setInterval(() => {
          window.scrollBy(0, scrollSpeed);
        }, 16);
      }
    };

    const clearScroll = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    document.addEventListener("dragover", handleGlobalDragOver, { capture: true });
    document.addEventListener("dragend", clearScroll);
    document.addEventListener("drop", clearScroll);

    return () => {
      document.removeEventListener("dragover", handleGlobalDragOver, { capture: true });
      document.removeEventListener("dragend", clearScroll);
      document.removeEventListener("drop", clearScroll);
      clearScroll();
    };
  }, [draggedNode]);

  // ── Root drop zone handlers ────────────────────────────────────────
  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDropAtRoot = vm.handleDropAtRoot;
  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleDropAtRoot();
    },
    [handleDropAtRoot]
  );

  const showRootDropZone = vm.draggedNode != null;

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <PageHeader
        className="mb-0"
        icon={Menu}
        title={t("menus.title")}
        description={t("menus.description")}
        meta={[{ label: t("menus.items"), value: Number(vm.totalItems).toLocaleString() }]}
        badges={
          vm.isReordering ? (
            <Badge variant="info">
              <LoadingSpinner size="inline" showText={false} />
              {t("menus.saving")}
            </Badge>
          ) : undefined
        }
        actions={
          <>
            {/* Customize Menu — link to dedicated page */}
            {vm.canCustomize && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/customization/menus/customize">
                  <Palette className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("menus.customizeMenu")}
                </Link>
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={vm.expandAll}>
              <ChevronDown className="me-1 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.expandAll")}
            </Button>
            <Button variant="outline" size="sm" onClick={vm.collapseAll}>
              <ChevronRight className="me-1 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.collapseAll")}
            </Button>
            <Button variant="outline" size="sm" onClick={vm.refetch} loading={vm.isLoading}>
              {!vm.isLoading && (
                <RefreshCw className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {t("common.refresh")}
            </Button>
            {vm.canCreate && (
              <Button size="sm" onClick={() => vm.openCreateDialog()}>
                <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                {t("menus.createMenuItem")}
              </Button>
            )}
          </>
        }
      />

      {/* ── Workspace Filter Tabs ───────────────────────────────────────── */}
      {workspaceGroups.length > 0 && (
        <div className="relative">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 pb-1">
              {/* "All" tab */}
              <WorkspaceFilterTab
                label={t("menus.allWorkspaces")}
                count={vm.totalItems}
                isActive={filterWorkspaceId === null}
                accentColor={null}
                onClick={() => setFilterWorkspaceId(null)}
              />

              {/* One tab per workspace */}
              {workspaceGroups
                .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder)
                .map((ws) => (
                  <WorkspaceFilterTab
                    key={ws.workspaceKey}
                    label={ws.getLocalizedName(language)}
                    count={workspaceCounts(ws.workspaceId ?? ws.workspaceKey)}
                    isActive={filterWorkspaceId === (ws.workspaceId ?? ws.workspaceKey)}
                    accentColor={ws.accentColor}
                    onClick={() => setFilterWorkspaceId(ws.workspaceId ?? ws.workspaceKey)}
                  />
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* ── Menu Tree ──────────────────────────────────────────────────── */}
      {vm.isLoading ? (
        <LoadingSpinner showText={false} />
      ) : vm.isError ? (
        <ErrorMessage message={vm.error?.message || t("common.error")} onRetry={vm.refetch} />
      ) : vm.menuTree.length === 0 ? (
        <EmptyState
          size="lg"
          icon={Menu}
          title={t("menus.emptyTitle")}
          description={t("menus.emptyDesc")}
          action={
            vm.canCreate ? (
              <Button onClick={() => vm.openCreateDialog()}>
                <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                {t("menus.createMenuItem")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-nx-ink-2">
                {filterWorkspaceId !== null
                  ? `${t("menus.workspaceItems")} · ${filteredTree.length}`
                  : t("menus.structure")}
              </CardTitle>
              <div className="flex items-center gap-4 text-xs text-nx-ink-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t("menus.activeItems")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t("menus.inactiveItems")}</span>
                </div>
                {vm.canReorder && (
                  <div className="flex items-center gap-1">
                    <GripHint />
                    <span>{t("menus.dragToReorder")}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent ref={scrollContainerRef}>
            <SectionState
              isLoading={false}
              isEmpty={filteredTree.length === 0 && filterWorkspaceId !== null}
              emptyMessage={t("menus.noWorkspaceItemsDesc")}
              emptyIcon={<Grid3X3 className="h-4 w-4" aria-hidden="true" />}
            >
              <div className="space-y-0.5">
                {filteredTree
                  .sort((a, b) => a.order - b.order)
                  .map((node, index, arr) => (
                    <MenuTreeItem
                      key={node.id}
                      node={node}
                      language={vm.language}
                      canReorder={vm.canReorder && filterWorkspaceId === null}
                      expandedNodes={vm.expandedNodes}
                      onToggleExpand={vm.toggleExpand}
                      draggedNode={vm.draggedNode}
                      dropTarget={vm.dropTarget}
                      onDragStart={vm.handleDragStart}
                      onDragOver={vm.handleDragOver}
                      onDragLeave={vm.handleDragLeave}
                      onDragEnd={vm.handleDragEnd}
                      onDrop={vm.handleDrop}
                      onEdit={vm.openEditDialog}
                      onDelete={vm.openDeleteDialog}
                      onAddChild={vm.openCreateDialog}
                      onMoveUp={index > 0 ? () => vm.handleMoveUp(node.id) : undefined}
                      onMoveDown={
                        index < arr.length - 1 ? () => vm.handleMoveDown(node.id) : undefined
                      }
                      onMoveUpChild={vm.handleMoveUp}
                      onMoveDownChild={vm.handleMoveDown}
                      canCreate={vm.canCreate}
                      canEdit={vm.canEdit}
                      canDelete={vm.canDelete}
                      hasAnyAction={vm.canCreate || vm.canEdit || vm.canDelete}
                    />
                  ))}
              </div>

              {/* Root Drop Zone — visible only during drag, disabled when filter is active */}
              {showRootDropZone && filterWorkspaceId === null && (
                <div
                  onDragOver={handleRootDragOver}
                  onDrop={handleRootDrop}
                  className={cn(
                    "mt-3 rounded-nx-lg border-2 border-dashed border-nx-line px-3 py-4",
                    "text-center text-sm text-nx-ink-3",
                    "transition-[color,background-color,border-color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                    "hover:border-info hover:bg-info/10 hover:text-info"
                  )}
                >
                  <ArrowDownToLine className="me-2 inline-block h-4 w-4" aria-hidden="true" />
                  {t("menus.dropToRoot")}
                </div>
              )}
            </SectionState>
          </CardContent>
        </Card>
      )}

      {/* ── Workspace Overview Panel ────────────────────────────────────── */}
      {workspaceGroups.length > 0 && (
        <WorkspaceOverviewPanel
          workspaceGroups={workspaceGroups}
          menuTree={vm.menuTree}
          language={language}
          workspaceCounts={workspaceCounts}
          onFilterSelect={(id) => setFilterWorkspaceId(id)}
          t={t}
        />
      )}

      {/* ── Dialogs — Admin CRUD only ────────────────────────────────── */}
      <MenuFormDialog
        open={vm.createDialogOpen}
        onOpenChange={vm.setCreateDialogOpen}
        mode="create"
        parentNode={vm.parentForNew}
        onSubmit={vm.onCreateSubmit}
        isPending={vm.isCreating}
      />
      <MenuFormDialog
        open={vm.editDialogOpen}
        onOpenChange={vm.setEditDialogOpen}
        mode="edit"
        editNode={vm.selectedNode}
        onSubmit={vm.onEditSubmit}
        isPending={vm.isUpdating}
      />
      <DeleteMenuDialog
        open={vm.deleteDialogOpen}
        onOpenChange={vm.setDeleteDialogOpen}
        itemName={vm.deleteNodeName}
        onConfirm={vm.onDeleteConfirm}
        isPending={vm.isDeleting}
      />
    </div>
  );
}

// ── Workspace Filter Tab ──────────────────────────────────────────────────────

interface WorkspaceFilterTabProps {
  label: string;
  count: number;
  isActive: boolean;
  accentColor: string | null;
  onClick: () => void;
}

function WorkspaceFilterTab({
  label,
  count,
  isActive,
  accentColor,
  onClick,
}: WorkspaceFilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-nx-control px-3 py-2 text-sm font-medium",
        "border transition-[color,background-color,border-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        "focus-visible:shadow-nx-focus focus-visible:outline-none",
        isActive
          ? accentColor
            ? "border-transparent text-nx-on-fill"
            : "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill"
          : "border-nx-line bg-transparent text-nx-ink-2 hover:border-nx-line-hi hover:text-nx-ink"
      )}
      style={
        isActive && accentColor ? { background: accentColor, borderColor: accentColor } : undefined
      }
    >
      {!accentColor && isActive && <Layers className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs leading-none",
          isActive
            ? "bg-[color:color-mix(in_srgb,var(--nx-on-fill)_20%,transparent)] text-nx-on-fill"
            : "bg-nx-raised-2 text-nx-ink-3"
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ── Workspace Overview Panel ──────────────────────────────────────────────────

interface WorkspaceOverviewPanelProps {
  workspaceGroups: WorkspaceGroup[];
  menuTree: MenuTreeNode[];
  language: string;
  workspaceCounts: (id: string) => number;
  onFilterSelect: (id: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function WorkspaceOverviewPanel({
  workspaceGroups,
  menuTree,
  language,
  workspaceCounts,
  onFilterSelect,
  t,
}: WorkspaceOverviewPanelProps) {
  const unassignedCount = menuTree.filter((n) => !n.workspaceId).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-nx-ink-2">
          <Grid3X3 className="h-4 w-4" aria-hidden="true" />
          {t("menus.workspaceOverview")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workspaceGroups
            .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder)
            .map((ws) => {
              const id = ws.workspaceId ?? ws.workspaceKey;
              const count = workspaceCounts(id);
              const name = ws.getLocalizedName(language);

              return (
                <button
                  key={ws.workspaceKey}
                  type="button"
                  onClick={() => onFilterSelect(id)}
                  className={cn(
                    "group flex items-center justify-between rounded-nx-lg border border-nx-line px-4 py-3",
                    "bg-nx-raised text-start transition-[color,background-color,border-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "hover:border-nx-line-hi hover:bg-nx-raised-2",
                    "focus-visible:shadow-nx-focus focus-visible:outline-none"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Workspace color indicator */}
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      aria-hidden="true"
                      style={{ background: ws.accentColor ?? "var(--nx-ink-3)" }}
                    />
                    <span className="text-sm font-medium text-nx-ink">{name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                    <ChevronRightIcon
                      className="h-3.5 w-3.5 text-nx-ink-3 opacity-0 transition-opacity duration-nx-micro ease-nx-enter group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              );
            })}

          {/* Unassigned items tile */}
          {unassignedCount > 0 && (
            <div className="flex items-center justify-between rounded-nx-lg border border-dashed border-nx-line bg-nx-hover px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-nx-raised-2"
                  aria-hidden="true"
                />
                <span className="text-sm text-nx-ink-2">{t("menus.unassigned")}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {unassignedCount}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Small grip hint icon for header */
function GripHint() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </svg>
  );
}
