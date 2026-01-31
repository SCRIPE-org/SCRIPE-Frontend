/**
 * Tenants View
 *
 * Main view component for tenant management with tree hierarchy.
 * Fully localized with i18n support.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useTenantsViewModel } from "../viewmodels/useTenantsViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantTreeNode, Tenant } from "../../domain/entities/Tenant";
import type { CreateTenantRequest, UpdateTenantRequest } from "../../domain/entities/TenantRequests";
import { Plus, Search, RefreshCw, List, Network, Loader2 } from "lucide-react";

// Extracted components
import { TenantTreeItem } from "../components/TenantTreeItem";
import { TenantListItem } from "../components/TenantListItem";
import {
      CreateTenantDialog,
      EditTenantDialog,
      DeleteTenantDialog,
      initialCreateForm,
      initialEditForm,
      type CreateFormState,
      type EditFormState,
} from "../components/TenantDialogs";

export function TenantsView() {
      const { t } = useI18n();

      // View state
      const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
      const [searchInput, setSearchInput] = useState("");
      const [page, setPage] = useState(1);

      // Dialog state
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedNode, setSelectedNode] = useState<TenantTreeNode | null>(null);
      const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
      const [parentForNew, setParentForNew] = useState<TenantTreeNode | null>(null);

      // Form state
      const [createForm, setCreateForm] = useState<CreateFormState>(initialCreateForm);
      const [editForm, setEditForm] = useState<EditFormState>(initialEditForm);

      // ViewModel
      const {
            tree,
            tenants,
            totalCount,
            isLoading,
            handleCreate,
            handleUpdate,
            handleDelete,
            refetch,
            isCreating,
            isUpdating,
            isDeleting,
      } = useTenantsViewModel({
            viewMode,
            page,
            pageSize: 20,
            search: searchInput || undefined,
      });

      // Calculate total tenants from tree
      const totalTenants = useMemo(() => {
            const countNodes = (nodes: TenantTreeNode[]): number => {
                  if (!Array.isArray(nodes)) return 0;
                  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children || []), 0);
            };
            return viewMode === "tree" ? countNodes(tree) : totalCount;
      }, [tree, totalCount, viewMode]);

      // Handlers for tree view
      const handleOpenCreateFromTree = useCallback((parent?: TenantTreeNode) => {
            setParentForNew(parent || null);
            setCreateForm(initialCreateForm);
            setCreateDialogOpen(true);
      }, []);

      const handleOpenEditFromTree = useCallback((node: TenantTreeNode) => {
            setSelectedNode(node);
            setSelectedTenant(null);
            setEditForm({
                  name: node.name,
                  description: node.description || "",
                  isActive: node.isActive,
            });
            setEditDialogOpen(true);
      }, []);

      const handleOpenDeleteFromTree = useCallback((node: TenantTreeNode) => {
            setSelectedNode(node);
            setSelectedTenant(null);
            setDeleteDialogOpen(true);
      }, []);

      // Handlers for list view
      const handleOpenEditFromList = useCallback((tenant: Tenant) => {
            setSelectedTenant(tenant);
            setSelectedNode(null);
            setEditForm({
                  name: tenant.name,
                  description: tenant.description || "",
                  isActive: tenant.isActive,
            });
            setEditDialogOpen(true);
      }, []);

      const handleOpenDeleteFromList = useCallback((tenant: Tenant) => {
            setSelectedTenant(tenant);
            setSelectedNode(null);
            setDeleteDialogOpen(true);
      }, []);

      // Form submissions
      const onCreateSubmit = useCallback(async () => {
            if (!createForm.name || !createForm.code) return;
            const request: CreateTenantRequest = {
                  name: createForm.name,
                  code: createForm.code,
                  description: createForm.description || undefined,
                  parentId: parentForNew?.id,
            };
            await handleCreate(request);
            setCreateDialogOpen(false);
            setCreateForm(initialCreateForm);
            setParentForNew(null);
      }, [createForm, parentForNew, handleCreate]);

      const onEditSubmit = useCallback(async () => {
            const id = selectedNode?.id || selectedTenant?.id;
            if (!id || !editForm.name) return;
            const request: UpdateTenantRequest = {
                  name: editForm.name,
                  description: editForm.description || undefined,
                  isActive: editForm.isActive,
            };
            await handleUpdate(id, request);
            setEditDialogOpen(false);
            setSelectedNode(null);
            setSelectedTenant(null);
      }, [selectedNode, selectedTenant, editForm, handleUpdate]);

      const onDeleteConfirm = useCallback(async () => {
            const id = selectedNode?.id || selectedTenant?.id;
            if (!id) return;
            await handleDelete(id);
            setDeleteDialogOpen(false);
            setSelectedNode(null);
            setSelectedTenant(null);
      }, [selectedNode, selectedTenant, handleDelete]);

      const selectedName = selectedNode?.name || selectedTenant?.name || "";

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                        <div>
                              <h1 className="text-3xl font-bold tracking-tight">{t("tenant.title")}</h1>
                              <p className="text-muted-foreground">{t("tenant.description")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => refetch()}>
                                    <RefreshCw className="h-4 w-4" />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_CREATE}>
                                    <Button onClick={() => handleOpenCreateFromTree()}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          {t("tenant.addTenant")}
                                    </Button>
                              </PermissionGate>
                        </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between gap-4">
                        <Card className="px-4 py-2">
                              <div className="text-sm text-muted-foreground">{t("tenant.totalTenants")}</div>
                              <div className="text-2xl font-bold">{totalTenants}</div>
                        </Card>

                        <div className="flex items-center gap-2">
                              <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                          placeholder={t("tenant.searchPlaceholder")}
                                          value={searchInput}
                                          onChange={(e) => setSearchInput(e.target.value)}
                                          className="pl-9 w-64"
                                    />
                              </div>
                              <div className="flex border rounded-md">
                                    <Button
                                          variant={viewMode === "tree" ? "secondary" : "ghost"}
                                          size="icon"
                                          onClick={() => setViewMode("tree")}
                                    >
                                          <Network className="h-4 w-4" />
                                    </Button>
                                    <Button
                                          variant={viewMode === "list" ? "secondary" : "ghost"}
                                          size="icon"
                                          onClick={() => setViewMode("list")}
                                    >
                                          <List className="h-4 w-4" />
                                    </Button>
                              </div>
                        </div>
                  </div>

                  {/* Content */}
                  {isLoading ? (
                        <Card>
                              <CardContent className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </CardContent>
                        </Card>
                  ) : viewMode === "tree" ? (
                        <Card>
                              <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {t("tenant.hierarchy")}
                                    </CardTitle>
                              </CardHeader>
                              <CardContent>
                                    {Array.isArray(tree) && tree.length > 0 ? (
                                          <div className="space-y-1">
                                                {tree.map((node) => (
                                                      <TenantTreeItem
                                                            key={node.id}
                                                            node={node}
                                                            onEdit={handleOpenEditFromTree}
                                                            onDelete={handleOpenDeleteFromTree}
                                                            onAddChild={handleOpenCreateFromTree}
                                                      />
                                                ))}
                                          </div>
                                    ) : (
                                          <div className="text-center py-8 text-muted-foreground">
                                                {t("tenant.noTenantsDescription")}
                                          </div>
                                    )}
                              </CardContent>
                        </Card>
                  ) : (
                        <Card>
                              <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {t("tenant.allTenants")}
                                    </CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                    {tenants.length > 0 ? (
                                          <div>
                                                {tenants.map((tenant) => (
                                                      <TenantListItem
                                                            key={tenant.id}
                                                            tenant={tenant}
                                                            onEdit={handleOpenEditFromList}
                                                            onDelete={handleOpenDeleteFromList}
                                                      />
                                                ))}
                                          </div>
                                    ) : (
                                          <div className="text-center py-8 text-muted-foreground">
                                                {t("tenant.noTenantsDescription")}
                                          </div>
                                    )}
                              </CardContent>
                        </Card>
                  )}

                  {/* Dialogs */}
                  <CreateTenantDialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                        parentTenant={parentForNew}
                        form={createForm}
                        setForm={setCreateForm}
                        onSubmit={onCreateSubmit}
                        isLoading={isCreating}
                  />

                  <EditTenantDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        tenantName={selectedName}
                        form={editForm}
                        setForm={setEditForm}
                        onSubmit={onEditSubmit}
                        isLoading={isUpdating}
                  />

                  <DeleteTenantDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        tenantName={selectedName}
                        onConfirm={onDeleteConfirm}
                        isLoading={isDeleting}
                  />
            </div>
      );
}
