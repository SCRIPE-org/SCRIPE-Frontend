/**
 * Menus View (Pure UI) — Admin Management
 *
 * Composes all menu-tree components with native HTML5 DnD.
 * Handles CRUD operations and base reordering only.
 * Override customization is on a separate page: /customization/menus/customize
 */
"use client";

import { useRef, useEffect, useCallback } from "react";
import { useMenusViewModel } from "../viewmodels/useMenusViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";

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
} from "lucide-react";
import { cn } from "@core/common/utils";
import Link from "next/link";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function MenusView() {
  useModuleLocales(() => import("../../../locales"), "menus");

  const { t } = useI18n();
  const vm = useMenusViewModel();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-scroll when dragging near edges ───────────────────────────
  useEffect(() => {
    if (!vm.draggedNode) return;

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
  }, [vm.draggedNode]);

  // ── Root drop zone handlers ────────────────────────────────────────
  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      vm.handleDropAtRoot();
    },
    [vm.handleDropAtRoot]
  );

  const showRootDropZone = vm.draggedNode != null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("menus.title")}</h1>
          <p className="text-muted-foreground">{t("menus.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {vm.totalItems} {t("menus.items")}
          </Badge>
          {vm.isReordering && (
            <Badge variant="outline" className="animate-pulse text-primary">
              {t("menus.saving") ?? "Saving..."}
            </Badge>
          )}

          {/* Customize Menu — link to dedicated page */}
          {vm.canCustomize && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/customization/menus/customize">
                <Palette className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
                {t("menus.customizeMenu")}
              </Link>
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={vm.expandAll}>
            <ChevronDown className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
            {t("common.expandAll") ?? "Expand All"}
          </Button>
          <Button variant="outline" size="sm" onClick={vm.collapseAll}>
            <ChevronRight className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
            {t("common.collapseAll") ?? "Collapse All"}
          </Button>
          <Button variant="outline" size="icon" onClick={vm.refetch} disabled={vm.isLoading}>
            <RefreshCw className={cn("h-4 w-4", vm.isLoading && "animate-spin")} />
          </Button>
          {vm.canCreate && (
            <Button onClick={() => vm.openCreateDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("menus.createMenuItem")}
            </Button>
          )}
        </div>
      </div>

      {/* Menu Tree */}
      {vm.isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            </div>
          </CardContent>
        </Card>
      ) : vm.menuTree.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Menu className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t("menus.emptyTitle")}</h3>
            <p className="mb-6 max-w-sm text-center text-muted-foreground">
              {t("menus.emptyDesc")}
            </p>
            {vm.canCreate && (
              <Button onClick={() => vm.openCreateDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                {t("menus.createMenuItem")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("menus.structure")}
              </CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{t("menus.activeItems")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>{t("menus.inactiveItems")}</span>
                </div>
                {vm.canReorder && (
                  <div className="flex items-center gap-1">
                    <GripHint />
                    <span>{t("menus.dragToReorder") ?? "Drag to reorder"}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent ref={scrollContainerRef}>
            <div className="space-y-0.5">
              {vm.menuTree
                .sort((a, b) => a.order - b.order)
                .map((node, index, arr) => (
                  <MenuTreeItem
                    key={node.id}
                    node={node}
                    language={vm.language}
                    canReorder={vm.canReorder}
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

            {/* Root Drop Zone — visible only during drag */}
            {showRootDropZone && (
              <div
                onDragOver={handleRootDragOver}
                onDrop={handleRootDrop}
                className={cn(
                  "mt-3 rounded-lg border-2 border-dashed px-3 py-4",
                  "text-center text-sm text-muted-foreground",
                  "transition-all duration-200",
                  "hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-500"
                )}
              >
                <ArrowDownToLine className="mr-2 inline-block h-4 w-4" />
                {t("menus.dropToRoot") ?? "Drop here to move to root level"}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs — Admin CRUD only */}
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
