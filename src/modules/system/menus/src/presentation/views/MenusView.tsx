/**
 * Menus View (Pure UI)
 *
 * ~60-line view that destructures everything from the orchestrator
 * ViewModel and composes section components.
 */
"use client";

import { useMenusViewModel } from "../viewmodels/useMenusViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { MenuTreeItem } from "../components/MenuTreeItem";
import { MenuFormDialog } from "../components/MenuFormDialog";
import { DeleteMenuDialog } from "../components/DeleteMenuDialog";
import { Plus, Menu, RefreshCw, Eye, EyeOff } from "lucide-react";
import { cn } from "@core/common/utils";
import {
      DndContext,
      closestCenter,
      KeyboardSensor,
      PointerSensor,
      useSensor,
      useSensors,
} from "@dnd-kit/core";
import {
      SortableContext,
      verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function MenusView() {
      const { t } = useI18n();
      const vm = useMenusViewModel();

      const sensors = useSensors(
            useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
            useSensor(KeyboardSensor)
      );

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                        <div>
                              <h1 className="text-3xl font-bold tracking-tight">{t("menus.title")}</h1>
                              <p className="text-muted-foreground">{t("menus.description")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                              <Badge variant="secondary">{vm.totalItems} {t("menus.items")}</Badge>
                              {vm.isReordering && (
                                    <Badge variant="outline" className="text-primary animate-pulse">
                                          {t("menus.saving") ?? "Saving..."}
                                    </Badge>
                              )}
                              <Button variant="outline" size="icon" onClick={vm.refetch} disabled={vm.isLoading}>
                                    <RefreshCw className={cn("h-4 w-4", vm.isLoading && "animate-spin")} />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                    <Button onClick={() => vm.openCreateDialog()}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          {t("menus.createMenuItem")}
                                    </Button>
                              </PermissionGate>
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
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                          <Menu className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{t("menus.emptyTitle")}</h3>
                                    <p className="text-muted-foreground text-center mb-6 max-w-sm">
                                          {t("menus.emptyDesc")}
                                    </p>
                                    <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                          <Button onClick={() => vm.openCreateDialog()}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                {t("menus.createMenuItem")}
                                          </Button>
                                    </PermissionGate>
                              </CardContent>
                        </Card>
                  ) : (
                        <Card>
                              <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                          <CardTitle className="text-sm font-medium text-muted-foreground">
                                                {t("menus.structure")}
                                          </CardTitle>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>{t("menus.activeItems")}</span>
                                                <span className="mx-1">·</span>
                                                <EyeOff className="h-3.5 w-3.5" />
                                                <span>{t("menus.inactiveItems")}</span>
                                          </div>
                                    </div>
                              </CardHeader>
                              <CardContent>
                                    <DndContext
                                          sensors={sensors}
                                          collisionDetection={closestCenter}
                                          onDragEnd={vm.handleDragEnd}
                                    >
                                          <SortableContext
                                                items={vm.sortableIds}
                                                strategy={verticalListSortingStrategy}
                                          >
                                                <div className="space-y-0.5">
                                                      {vm.menuTree
                                                            .sort((a, b) => a.order - b.order)
                                                            .map((node, index, arr) => (
                                                                  <MenuTreeItem
                                                                        key={node.id}
                                                                        node={node}
                                                                        language={vm.language}
                                                                        canReorder={vm.canReorder}
                                                                        onEdit={vm.openEditDialog}
                                                                        onDelete={vm.openDeleteDialog}
                                                                        onAddChild={vm.openCreateDialog}
                                                                        onMoveUp={index > 0 ? () => vm.handleMoveUp(node.id) : undefined}
                                                                        onMoveDown={index < arr.length - 1 ? () => vm.handleMoveDown(node.id) : undefined}
                                                                  />
                                                            ))}
                                                </div>
                                          </SortableContext>
                                    </DndContext>
                              </CardContent>
                        </Card>
                  )}

                  {/* Dialogs */}
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
