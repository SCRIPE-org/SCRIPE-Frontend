// FILE-EXCEPTION: file length
/**
 * Feature Overrides View
 *
 * Tenant-scoped view showing:
 * 1. Resolved features table with set-override action
 * 2. Current overrides table with edit/remove actions
 * 3. Set-override dialog with value + reason fields
 *
 * SOLID: Zero useState, zero business logic.
 * All state and pagination managed by ViewModel.
 */
"use client";

import { useOverridesViewModel } from "../viewmodels/useOverridesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Trash2, Pencil, Shield, Layers, DollarSign } from "lucide-react";
import { Textarea } from "@core/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { formatUtc, resolveBilingualLabel } from "@core/common/utils";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";

/* ============================================
 * CONSTANTS
 * ============================================ */

const SOURCE_BADGES: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Default: "outline",
  Edition: "secondary",
  Override: "default",
};

/* ============================================
 * VIEW
 * ============================================ */

interface OverridesViewProps {
  tenantId: string;
}

/**
 * Presentation UI component rendering the overrides view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function OverridesView({ tenantId }: OverridesViewProps) {
  useModuleLocales(() => import("../../../../core/locales"), "entitlements-shared");
  const { t } = useI18n();
  const vm = useOverridesViewModel(tenantId);

  if (vm.isLoading) {
    return <LoadingSpinner />;
  }

  if (vm.error) {
    return <ErrorMessage message={t("common.error")} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("entitlements.overrides.title")}</h2>
        <p className="text-nx-ink-2">{t("entitlements.overrides.description")}</p>
      </div>

      <Tabs defaultValue="resolved" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resolved" className="gap-2">
            <Layers className="h-4 w-4" />
            {t("entitlements.overrides.resolvedFeatures")}
          </TabsTrigger>
          <TabsTrigger value="overrides" className="gap-2">
            <Shield className="h-4 w-4" />
            {t("entitlements.overrides.title")}
            {vm.overrides.length > 0 && (
              <Badge variant="secondary" className="ms-1">
                {vm.overrides.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resolved">
          <ResolvedFeaturesCard vm={vm} t={t} />
        </TabsContent>

        <TabsContent value="overrides">
          <CurrentOverridesCard vm={vm} t={t} />
        </TabsContent>
      </Tabs>

      <SetOverrideDialog vm={vm} t={t} />
      <CostDialog vm={vm} t={t} />
    </div>
  );
}

/* ============================================
 * RESOLVED FEATURES CARD
 * ============================================ */

type VM = ReturnType<typeof useOverridesViewModel>;
type TFn = (key: string, params?: Record<string, any>) => string;

function ResolvedFeaturesCard({ vm, t }: { vm: VM; t: TFn }) {
  const { language } = useI18n();

  return (
    <Card>
      <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <CardTitle>{t("entitlements.overrides.resolvedFeatures")}</CardTitle>
          <CardDescription>{t("entitlements.overrides.resolvedDesc")}</CardDescription>
        </div>
        <Input
          placeholder={t("common.search")}
          className="max-w-xs"
          value={vm.resolvedSearch}
          onChange={(e) => vm.setResolvedSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent>
        {vm.paginatedResolved.length === 0 ? (
          <p className="py-8 text-center text-nx-ink-3">
            {vm.resolvedFeatures.length === 0
              ? t("common.noResults")
              : t("common.noResultsForSearch")}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("entitlements.features.featureName")}</TableHead>
                  <TableHead>{t("entitlements.features.featureKey")}</TableHead>
                  <TableHead>{t("entitlements.features.valueType")}</TableHead>
                  <TableHead>{t("entitlements.features.defaultValue")}</TableHead>
                  <TableHead>{t("entitlements.overrides.source")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.paginatedResolved.map((f) => (
                  <TableRow key={f.featureId}>
                    <TableCell className="font-medium">
                      {resolveBilingualLabel(f.nameEn, f.nameAr, language)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{f.key}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{f.valueType}</Badge>
                    </TableCell>
                    <TableCell>
                      {f.valueType === "Boolean" ? (
                        <Badge variant={f.effectiveValue === "true" ? "default" : "secondary"}>
                          {f.effectiveValue === "true" ? t("tenant.enabled") : t("tenant.disabled")}
                        </Badge>
                      ) : (
                        <span className="font-semibold">{f.effectiveValue}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={SOURCE_BADGES[f.source] ?? "outline"}>
                        {t(`entitlements.overrides.source${f.source}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          vm.openSetOverride(f.featureId, f.key, f.valueType, f.effectiveValue)
                        }
                      >
                        <Pencil className="me-1 h-4 w-4" />
                        {t("entitlements.overrides.set")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar
              page={vm.resolvedPage}
              totalPages={vm.resolvedTotalPages}
              setPage={vm.setResolvedPage}
              t={t}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================
 * CURRENT OVERRIDES CARD
 * ============================================ */

function CurrentOverridesCard({ vm, t }: { vm: VM; t: TFn }) {
  const totalCostUsd = vm.overrides.reduce((sum, o) => sum + (o.costAmountUsd ?? 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <CardTitle>{t("entitlements.overrides.title")}</CardTitle>
          <CardDescription>{t("entitlements.overrides.description")}</CardDescription>
        </div>
        {totalCostUsd > 0 && (
          <div className="flex items-center gap-2 rounded-nx-md border border-success/30 bg-success/5 px-3 py-2">
            <DollarSign className="h-4 w-4 text-success" />
            <div className="text-sm">
              <span className="text-nx-ink-3">
                {t("entitlements.overrides.totalCost")}:
              </span>{" "}
              <span className="font-bold text-success">${totalCostUsd.toFixed(2)} USD</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {vm.overrides.length === 0 ? (
          <p className="py-8 text-center text-nx-ink-3">
            {t("entitlements.overrides.noOverrides")}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("entitlements.features.featureName")}</TableHead>
                  <TableHead>{t("entitlements.features.valueType")}</TableHead>
                  <TableHead>{t("entitlements.features.defaultValue")}</TableHead>
                  <TableHead>{t("entitlements.overrides.reason")}</TableHead>
                  <TableHead>{t("common.createdAt")}</TableHead>
                  <TableHead>{t("entitlements.overrides.costAmount")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vm.paginatedOverrides.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{o.featureName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{o.valueType}</Badge>
                    </TableCell>
                    <TableCell>
                      {o.valueType === "Boolean" ? (
                        <Badge variant={o.value === "true" ? "default" : "secondary"}>
                          {o.value === "true" ? t("tenant.enabled") : t("tenant.disabled")}
                        </Badge>
                      ) : (
                        <span className="font-semibold">{o.value}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-nx-ink-3">
                      {o.reason || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatUtc(o.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {o.costAmountUsd != null && o.costAmountUsd > 0 ? (
                        <div>
                          <span className="font-bold text-success">
                            ${o.costAmountUsd.toFixed(2)}
                          </span>
                          {o.costReason && (
                            <p
                              className="mt-0.5 max-w-[120px] truncate text-xs text-nx-ink-3"
                              title={o.costReason}
                            >
                              {o.costReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-nx-ink-3">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            vm.openSetOverride(o.featureId, o.featureName, o.valueType, o.value)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t("entitlements.overrides.setCost")}
                          onClick={() => vm.openCostDialog(o.id)}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => vm.removeOverride(o.featureId)}
                          loading={vm.isRemoving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar
              page={vm.overridesPage}
              totalPages={vm.overridesTotalPages}
              setPage={vm.setOverridesPage}
              t={t}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================
 * SET OVERRIDE DIALOG
 * ============================================ */

function SetOverrideDialog({ vm, t }: { vm: VM; t: TFn }) {
  return (
    <Dialog open={!!vm.editingFeature} onOpenChange={() => vm.closeSetOverride()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("entitlements.overrides.set")}</DialogTitle>
          <DialogDescription>{t("entitlements.overrides.setDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs text-nx-ink-3">
              {t("entitlements.features.featureName")}
            </Label>
            <p className="mt-1 font-mono text-sm">{vm.editingFeature?.featureName}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("entitlements.features.defaultValue")}</Label>
            {vm.editingFeature?.valueType === "Boolean" ? (
              <div className="flex items-center gap-2">
                <Switch
                  checked={vm.overrideValue === "true"}
                  onCheckedChange={(checked) => vm.setOverrideValue(checked ? "true" : "false")}
                />
                <span className="text-sm">
                  {vm.overrideValue === "true" ? t("tenant.enabled") : t("tenant.disabled")}
                </span>
              </div>
            ) : (
              <Input
                type={vm.editingFeature?.valueType === "Numeric" ? "number" : "text"}
                value={vm.overrideValue}
                onChange={(e) => vm.setOverrideValue(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("entitlements.overrides.reason")}</Label>
            <Input
              value={vm.overrideReason}
              onChange={(e) => vm.setOverrideReason(e.target.value)}
              placeholder={t("entitlements.overrides.reasonPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.closeSetOverride()}>
            {t("common.cancel")}
          </Button>
          <Button onClick={vm.submitOverride} loading={vm.isSaving}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================
 * COST ADJUSTMENT DIALOG
 * ============================================ */

function CostDialog({ vm, t }: { vm: VM; t: TFn }) {
  return (
    <Dialog
      open={!!vm.costOverrideId}
      onOpenChange={(open) => {
        if (!open) vm.closeCostDialog();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("entitlements.overrides.setCost")}</DialogTitle>
          <DialogDescription>
            {t("entitlements.overrides.setCostDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("entitlements.overrides.costAmount")}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={vm.costAmount}
              onChange={(e) => vm.setCostAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("entitlements.overrides.costReason")}</Label>
            <Textarea
              value={vm.costReason}
              onChange={(e) => vm.setCostReason(e.target.value)}
              placeholder={t("entitlements.overrides.costReasonPlaceholder")}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => vm.closeCostDialog()} disabled={vm.isSavingCost}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => vm.submitCost()}
            disabled={!vm.costAmount}
            loading={vm.isSavingCost}
          >
            {vm.isSavingCost ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================
 * PAGINATION BAR
 * ============================================ */

function PaginationBar({
  page,
  totalPages,
  setPage,
  t,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  t: TFn;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-between border-t pt-3">
      <p className="text-sm text-nx-ink-3">
        {t("common.page")} {page} / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          {t("common.previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
