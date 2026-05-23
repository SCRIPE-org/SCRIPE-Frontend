"use client";

import {
  Code2,
  RefreshCw,
  Plus,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  ArrowDownFromLine,
  Pencil,
} from "lucide-react";
import { useDefinitionsViewModel } from "../viewmodels/useDefinitionsViewModel";
import { DefinitionFormDialog } from "../components/DefinitionFormDialog";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Separator } from "@core/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import type { PluginDefinition } from "@modules/plugins/catalog";

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ def }: { def: PluginDefinition }) {
  const { t } = useI18n();
  if (def.isPublished)
    return <Badge variant="default">{t("plugins.defStatusPublished")}</Badge>;
  if (def.isInReview)
    return <Badge variant="outline">{t("plugins.defStatusPending")}</Badge>;
  if (def.isSuspended)
    return <Badge variant="destructive">{t("plugins.defStatusSuspended") ?? "Suspended"}</Badge>;
  if (def.isDeprecated)
    return <Badge variant="destructive">{t("plugins.defStatusDeprecated")}</Badge>;
  if (def.isApproved)
    return <Badge variant="default">{t("plugins.defStatusApproved") ?? "Approved"}</Badge>;
  return <Badge variant="secondary">{t("plugins.defStatusDraft")}</Badge>;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DefinitionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card className={`border bg-gradient-to-br ${color}`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-xl bg-background/80 p-3 shadow-sm">{icon}</div>
        <div className="min-w-0 flex-1">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {label}
          </CardDescription>
          <CardTitle className="mt-1 text-2xl font-bold tracking-tight">{value}</CardTitle>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function DefinitionsView() {
  useModuleLocales(() => import("../../../locales"), "plugins-definitions");
  const { t, language } = useI18n();
  const {
    definitions,
    isLoading,
    isError,
    refetch,
    stats,
    // Form
    isFormOpen,
    editingDefinition,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSubmit,
    isSubmitting,
    // Actions
    publish,
    deprecate,
    deleteDefinition,
    isPublishing,
    isDeprecating,
    isDeleting,
  } = useDefinitionsViewModel();

  if (isLoading) return <DefinitionsSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{t("plugins.definitionsError")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="me-2 h-4 w-4" />
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5">
            <Code2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("plugins.defTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("plugins.defSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="definitions-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="me-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button id="definitions-new" size="sm" onClick={openCreateForm}>
            <Plus className="me-2 h-4 w-4" />
            {t("plugins.defNew")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={t("plugins.defStatTotal")}
          value={stats.total}
          icon={<Code2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          color="from-violet-500/10 to-purple-500/10 border-violet-500/20"
        />
        <StatCard
          label={t("plugins.defStatPublished")}
          value={stats.published}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          color="from-emerald-500/10 to-green-500/10 border-emerald-500/20"
        />
        <StatCard
          label={t("plugins.defStatDraft")}
          value={stats.draft}
          icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          color="from-amber-500/10 to-yellow-500/10 border-amber-500/20"
        />
        <StatCard
          label={t("plugins.defStatDeprecated")}
          value={stats.deprecated}
          icon={<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
          color="from-red-500/10 to-rose-500/10 border-red-500/20"
        />
      </div>

      <Separator />

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("plugins.defTableTitle")}</CardTitle>
          <CardDescription>{t("plugins.defTableSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {definitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Globe className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">{t("plugins.defEmpty")}</p>
              <p className="text-xs text-muted-foreground">{t("plugins.defEmptyHint")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("plugins.defColKey")}</TableHead>
                  <TableHead>{t("plugins.defColName")}</TableHead>
                  <TableHead>{t("plugins.defColTier")}</TableHead>
                  <TableHead>{t("plugins.defColStatus")}</TableHead>
                  <TableHead>{t("plugins.defColCreated")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {definitions.map((def) => {
                  const displayName =
                    language === "ar" ? def.nameAr || def.name : def.name;
                  return (
                    <TableRow key={def.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {def.key}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted"
                            style={
                              def.colorHue != null
                                ? {
                                    background: `oklch(0.7 ${def.colorChroma ?? 0.2} ${def.colorHue})`,
                                  }
                                : undefined
                            }
                          >
                            <Code2 className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium">{displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={def.isTier1 ? "default" : "secondary"} className="text-xs">
                          {def.isTier1 ? t("plugins.tier1") : t("plugins.tier2")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge def={def} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {def.createdAtDisplay}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <Button
                            id={`def-edit-${def.id}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditForm(def)}
                            title={t("plugins.defEdit") || "Edit"}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* Publish */}
                          {!def.isPublished && !def.isDeprecated && (
                            <Button
                              id={`def-publish-${def.id}`}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-emerald-600 hover:text-emerald-700"
                              disabled={isPublishing}
                              onClick={() => publish(def.id)}
                              title={t("plugins.defPublish")}
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {/* Deprecate */}
                          {def.isPublished && (
                            <Button
                              id={`def-deprecate-${def.id}`}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-amber-600 hover:text-amber-700"
                              disabled={isDeprecating}
                              onClick={() => deprecate(def.id)}
                              title={t("plugins.defDeprecate")}
                            >
                              <ArrowDownFromLine className="h-4 w-4" />
                            </Button>
                          )}
                          {/* Delete */}
                          <Button
                            id={`def-delete-${def.id}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive/80"
                            disabled={isDeleting}
                            onClick={() => deleteDefinition(def.id)}
                            title={t("common.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <DefinitionFormDialog
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) closeForm(); }}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        editingDefinition={editingDefinition}
      />
    </div>
  );
}
