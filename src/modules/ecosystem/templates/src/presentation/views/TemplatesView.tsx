"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Skeleton } from "@core/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { FileText, Plus, RefreshCw, Loader2, Eye, Copy, Trash2 } from "lucide-react";
import { useTemplatesViewModel } from "../viewmodels/useTemplatesViewModel";

export function TemplatesView() {
  useModuleLocales(() => import("../../../locales"), "templates");
  const { t } = useI18n();
  const vm = useTemplatesViewModel();
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
            <FileText className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("templates.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("templates.description")}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => vm.setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />{t("templates.create")}
        </Button>
      </div>

      {vm.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : vm.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : vm.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <FileText className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("templates.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("templates.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t("templates.name") || "Name"}</TableHead>
                  <TableHead>{t("templates.category") || "Category"}</TableHead>
                  <TableHead>{t("templates.version") || "Version"}</TableHead>
                  <TableHead>{t("templates.status") || "Status"}</TableHead>
                  <TableHead className="text-right">{t("common.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.items.map((tpl: any, idx: number) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{tpl.name}</TableCell>
                    <TableCell><Badge variant="outline">{tpl.category ?? "General"}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{tpl.version ?? "1.0"}</TableCell>
                    <TableCell>
                      <Badge variant={tpl.status === "Active" || tpl.isActive ? "success" : "secondary"}>
                        {tpl.status ?? (tpl.isActive ? "Active" : "Draft")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => vm.handleView(tpl)}>
                          <Eye className="h-3.5 w-3.5" />{t("common.view") || "View"}
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="gap-1"
                          disabled={vm.isApplying && vm.applyingId === tpl.id}
                          onClick={() => vm.handleApply(tpl.id)}
                        >
                          {vm.isApplying && vm.applyingId === tpl.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {t("templates.apply") || "Apply"}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={() => vm.handleDelete(tpl.id)}>
                          <Trash2 className="h-3.5 w-3.5" />{t("common.delete") || "Delete"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={vm.createDialogOpen} onOpenChange={vm.setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("templates.createTitle") || "Create Template"}</DialogTitle>
            <DialogDescription>{t("templates.createDesc") || "Add a new configuration template."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("templates.name") || "Name"}</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Enterprise Setup" />
            </div>
            <div className="space-y-2">
              <Label>{t("templates.category") || "Category"}</Label>
              <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="General" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setCreateDialogOpen(false)}>{t("common.cancel") || "Cancel"}</Button>
            <Button disabled={!newName.trim() || vm.isCreating} onClick={() => vm.handleCreate({ name: newName, category: newCategory || "General" })}>
              {vm.isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={vm.viewDialogOpen} onOpenChange={vm.setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{vm.selectedTemplate?.name || "Template Details"}</DialogTitle>
            <DialogDescription>{vm.selectedTemplate?.description || t("templates.viewDesc") || "Template configuration details."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Category</span><Badge variant="outline">{vm.selectedTemplate?.category ?? "General"}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span>{vm.selectedTemplate?.version ?? "1.0"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="success">{vm.selectedTemplate?.status ?? "Active"}</Badge></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
