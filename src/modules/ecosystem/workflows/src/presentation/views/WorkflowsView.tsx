"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { GitBranch, Play, CheckCircle2, Pause, Plus, RefreshCw, Loader2 } from "lucide-react";
import { useWorkflowsViewModel } from "../viewmodels/useWorkflowsViewModel";
import { useState } from "react";

export function WorkflowsView() {
  useModuleLocales(() => import("../../../locales"), "workflows");
  const { t } = useI18n();
  const vm = useWorkflowsViewModel();
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("Manual");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
            <GitBranch className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("workflows.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("workflows.description")}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => vm.setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />{t("workflows.create")}
        </Button>
      </div>

      {vm.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
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
              <GitBranch className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("workflows.empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("workflows.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Definitions */}
          <Card>
            <CardHeader><CardTitle className="text-base">{t("workflows.definitions")}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t("workflows.name")}</TableHead>
                    <TableHead>{t("workflows.steps")}</TableHead>
                    <TableHead>{t("workflows.trigger")}</TableHead>
                    <TableHead>{t("workflows.status")}</TableHead>
                    <TableHead>{t("workflows.totalInstances")}</TableHead>
                    <TableHead>{t("workflows.lastRun")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.items.map((wf: any) => (
                    <TableRow key={wf.id}>
                      <TableCell className="font-mono text-xs">{wf.id}</TableCell>
                      <TableCell className="font-medium">{wf.name}</TableCell>
                      <TableCell><Badge variant="outline">{wf.steps ?? wf.stepCount} steps</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{wf.trigger ?? wf.triggerType}</Badge></TableCell>
                      <TableCell><Badge variant={wf.status === "Active" ? "success" : "secondary"} className="gap-1">{wf.status === "Active" ? <CheckCircle2 className="h-3 w-3" /> : <Pause className="h-3 w-3" />}{wf.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{wf.instances ?? wf.instanceCount ?? 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{wf.lastRun ?? wf.lastRunAt ?? "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          disabled={vm.isStarting && vm.startingId === wf.id}
                          onClick={() => vm.handleStart(wf.id)}
                        >
                          {vm.isStarting && vm.startingId === wf.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          {t("workflows.start")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={vm.createDialogOpen} onOpenChange={vm.setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("workflows.createTitle") || "Create Workflow"}</DialogTitle>
            <DialogDescription>{t("workflows.createDesc") || "Define a new workflow definition."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("workflows.name") || "Name"}</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("workflows.namePlaceholder") || "e.g. Onboarding Flow"}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("workflows.trigger") || "Trigger Type"}</Label>
              <Input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Manual"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setCreateDialogOpen(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              disabled={!newName.trim() || vm.isCreating}
              onClick={() => vm.handleCreate({ name: newName, triggerType: newTrigger })}
            >
              {vm.isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
