// FILE-EXCEPTION: file length
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
import { StatCard } from "@core/ui/stat-card";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import type { PluginDefinition } from "@modules/plugins/core";

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ def }: { def: PluginDefinition }) {
  const { t } = useI18n();
  if (def.isPublished) return <Badge variant="default">{t("plugins.defStatusPublished")}</Badge>;
  if (def.isInReview) return <Badge variant="outline">{t("plugins.defStatusPending")}</Badge>;
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

// ── Main View ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the definitions view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
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
      <ErrorMessage
        message={t("plugins.definitionsError")}
        onRetry={() => refetch()}
        className="py-20"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("plugins.defTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("plugins.defSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button id="definitions-refresh" variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button id="definitions-new" size="sm" onClick={openCreateForm}>
            <Plus className="me-2 h-4 w-4" />
            {t("plugins.defNew")}
          </Button>
        </div>
      </div>

      {/* Stats — the shared StatCard anatomy */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={t("plugins.defStatTotal")}
          value={stats.total.toLocaleString()}
          icon={Code2}
          tone="info"
        />
        <StatCard
          label={t("plugins.defStatPublished")}
          value={stats.published.toLocaleString()}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label={t("plugins.defStatDraft")}
          value={stats.draft.toLocaleString()}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label={t("plugins.defStatDeprecated")}
          value={stats.deprecated.toLocaleString()}
          icon={AlertTriangle}
          tone="danger"
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
            <EmptyState
              bare
              icon={Globe}
              title={t("plugins.defEmpty")}
              description={t("plugins.defEmptyHint")}
              action={
                <Button size="sm" onClick={openCreateForm}>
                  <Plus className="me-2 h-4 w-4" />
                  {t("plugins.defNew")}
                </Button>
              }
            />
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
                  const displayName = language === "ar" ? def.nameAr || def.name : def.name;
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
                              className="h-7 w-7 text-success hover:text-success/80"
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
                              className="h-7 w-7 text-warning hover:text-warning/80"
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
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        editingDefinition={editingDefinition}
      />
    </div>
  );
}
