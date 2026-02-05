/**
 * Tenant Permissions Dialog
 *
 * Professional dialog for managing permissions available to a tenant.
 * Pure UI component - all logic is in useTenantPermissionsDialog ViewModel.
 * 
 * COPIED FROM working RolePermissionsDialog pattern with tenant-specific adaptations.
 *
 * @module tenants/presentation/components
 */
"use client";

import {
      Dialog,
      DialogContent,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
} from "@core/ui/accordion";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { ScrollArea } from "@core/ui/scroll-area";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";
import {
      Loader2,
      Search,
      Shield,
      ShieldCheck,
      Check,
      Layers,
      FolderOpen,
      Building,
      Lock,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useTenantPermissionsDialog, type AvailablePermission } from "../viewmodels/useTenantPermissionsViewModel";

interface TenantPermissionsDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      tenantId: string;
      tenantName: string;
      parentTenantId?: string | null;
}

export function TenantPermissionsDialog(props: TenantPermissionsDialogProps) {
      const { open, onOpenChange, tenantName, parentTenantId } = props;
      const { t } = useI18n();
      const vm = useTenantPermissionsDialog(props);

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
                        {/* Header */}
                        <DialogHeader className="shrink-0 px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b">
                              <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                                          <Shield className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                          <DialogTitle className="text-lg font-semibold">
                                                {t("tenant.managePermissions") || "Manage Permissions"}
                                          </DialogTitle>
                                          {/* Use div instead of DialogDescription to avoid p > div nesting */}
                                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                      <Building className="h-3 w-3 me-1" />
                                                      {tenantName}
                                                </Badge>
                                                {vm.hasParent && (
                                                      <>
                                                            <span>•</span>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                  <Lock className="h-3 w-3" />
                                                                  <span>{t("tenant.limitedByParent") || "Limited by parent"}</span>
                                                            </div>
                                                      </>
                                                )}
                                          </div>
                                    </div>
                              </div>
                        </DialogHeader>

                        {/* Search & Stats Bar */}
                        <div className="shrink-0 px-6 py-3 border-b bg-muted/30">
                              <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input
                                                placeholder={t("common.search") || "Search permissions..."}
                                                value={vm.search}
                                                onChange={(e) => vm.setSearch(e.target.value)}
                                                className="ps-9 bg-background"
                                          />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                          <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Layers className="h-4 w-4" />
                                                <span>{vm.groupCount}</span>
                                          </div>
                                          <Separator orientation="vertical" className="h-4" />
                                          <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                <span className="font-medium text-primary">{vm.selectedCount}</span>
                                                <span className="text-muted-foreground">/ {vm.totalCount}</span>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Content - Scrollable Area */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                              <ScrollArea className="h-full">
                                    <div className="px-6 py-4">
                                          {vm.isLoading ? (
                                                <LoadingState />
                                          ) : vm.groupCount === 0 ? (
                                                <EmptyState />
                                          ) : (
                                                <PermissionGroups vm={vm} />
                                          )}
                                    </div>
                              </ScrollArea>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="shrink-0 px-6 py-4 border-t bg-muted/30">
                              <div className="flex items-center justify-between w-full">
                                    <p className="text-sm text-muted-foreground">
                                          {vm.hasParent && (
                                                <span className="flex items-center gap-1">
                                                      <Lock className="h-3 w-3" />
                                                      {t("tenant.permissionsLimitedByParent") || "Permissions limited by parent tenant"}
                                                </span>
                                          )}
                                          {!vm.hasParent && (
                                                <span>{vm.selectedCount} {t("common.selected") || "selected"}</span>
                                          )}
                                    </p>
                                    <div className="flex items-center gap-2">
                                          <Button variant="outline" onClick={() => onOpenChange(false)}>
                                                {t("common.cancel") || "Cancel"}
                                          </Button>
                                          <Button onClick={vm.save} disabled={vm.isSaving} className="min-w-[100px]">
                                                {vm.isSaving ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                      <>
                                                            <ShieldCheck className="h-4 w-4 me-2" />
                                                            {t("common.save") || "Save"}
                                                      </>
                                                )}
                                          </Button>
                                    </div>
                              </div>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function LoadingState() {
      const { t } = useI18n();
      return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                  <p>{t("common.loading") || "Loading..."}</p>
            </div>
      );
}

function EmptyState() {
      const { t } = useI18n();
      return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mb-3 opacity-50" />
                  <p className="font-medium">{t("permission.noPermissionsFound") || "No permissions found"}</p>
            </div>
      );
}

interface PermissionGroupsProps {
      vm: ReturnType<typeof useTenantPermissionsDialog>;
}

function PermissionGroups({ vm }: PermissionGroupsProps) {
      return (
            <Accordion
                  type="multiple"
                  value={vm.expandedGroups}
                  onValueChange={vm.setExpandedGroups}
                  className="space-y-3"
            >
                  {Object.entries(vm.grouped).map(([resource, perms]) => (
                        <PermissionGroup
                              key={resource}
                              resource={resource}
                              permissions={perms}
                              vm={vm}
                        />
                  ))}
            </Accordion>
      );
}

interface PermissionGroupProps {
      resource: string;
      permissions: AvailablePermission[];
      vm: ReturnType<typeof useTenantPermissionsDialog>;
}

function PermissionGroup({ resource, permissions, vm }: PermissionGroupProps) {
      const codes = permissions.map(p => p.code);
      const stats = vm.getGroupStats(codes);

      return (
            <AccordionItem
                  value={resource}
                  className="border rounded-xl overflow-hidden bg-card shadow-sm"
            >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&>svg]:text-muted-foreground">
                        <div className="flex items-center gap-3 flex-1">
                              {/* Move checkbox outside trigger - use div with checkbox indicator */}
                              <div
                                    className={cn(
                                          "h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center cursor-pointer",
                                          stats.allChecked && "bg-primary",
                                          stats.someChecked && "bg-primary/50"
                                    )}
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          vm.toggleGroup(codes);
                                    }}
                              >
                                    {(stats.allChecked || stats.someChecked) && (
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                    )}
                              </div>
                              <Badge variant={stats.count > 0 ? "default" : "secondary"} className="capitalize">
                                    {resource}
                              </Badge>
                              <div className="ms-auto me-2 text-sm">
                                    <span className={stats.count > 0 ? "text-primary font-medium" : "text-muted-foreground"}>
                                          {stats.count}
                                    </span>
                                    <span className="text-muted-foreground"> / {stats.total}</span>
                              </div>
                        </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                        <div className="grid gap-1.5 pt-1">
                              {permissions.map(p => (
                                    <PermissionItem key={p.id} permission={p} vm={vm} />
                              ))}
                        </div>
                  </AccordionContent>
            </AccordionItem>
      );
}

interface PermissionItemProps {
      permission: AvailablePermission;
      vm: ReturnType<typeof useTenantPermissionsDialog>;
}

function PermissionItem({ permission, vm }: PermissionItemProps) {
      const isChecked = vm.isChecked(permission.code);

      return (
            <label
                  className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                        isChecked
                              ? "bg-primary/5 border-primary/30 shadow-sm"
                              : "bg-background border-transparent hover:bg-muted/50"
                  )}
            >
                  <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => vm.toggle(permission.code)}
                  />
                  <div className="flex-1 min-w-0">
                        <div className={cn("font-medium text-sm", isChecked && "text-primary")}>
                              {vm.getName(permission)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              {permission.code}
                        </div>
                  </div>
                  {isChecked && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3.5 w-3.5" />
                        </div>
                  )}
            </label>
      );
}
