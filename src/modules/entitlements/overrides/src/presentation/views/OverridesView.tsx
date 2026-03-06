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
import {
      Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@core/ui/table";
import {
      Dialog, DialogContent, DialogDescription, DialogFooter,
      DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Loader2, Trash2, Pencil, Shield, Layers, DollarSign } from "lucide-react";
import { Textarea } from "@core/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { format } from "date-fns";

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

export function OverridesView({ tenantId }: OverridesViewProps) {
      const { t } = useI18n();
      const vm = useOverridesViewModel(tenantId);

      if (vm.isLoading) {
            return (
                  <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t("entitlements.overrides.title")}</h2>
                        <p className="text-muted-foreground">{t("entitlements.overrides.description")}</p>
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
                                          <Badge variant="secondary" className="ml-1">{vm.overrides.length}</Badge>
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
                  <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                              <CardTitle>{t("entitlements.overrides.resolvedFeatures")}</CardTitle>
                              <CardDescription>{t("entitlements.overrides.resolvedDesc")}</CardDescription>
                        </div>
                        <Input
                              placeholder={t("common.search") || "Search features..."}
                              className="max-w-xs"
                              value={vm.resolvedSearch}
                              onChange={(e) => vm.setResolvedSearch(e.target.value)}
                        />
                  </CardHeader>
                  <CardContent>
                        {vm.paginatedResolved.length === 0 ? (
                              <p className="text-center text-muted-foreground py-8">
                                    {vm.resolvedFeatures.length === 0
                                          ? t("common.noResults")
                                          : t("common.noResultsForSearch") || "No features match your search."}
                              </p>
                        ) : (
                              <>
                                    <Table>
                                          <TableHeader>
                                                <TableRow>
                                                      <TableHead>{t("entitlements.features.featureName")}</TableHead>
                                                      <TableHead>{t("entitlements.features.featureKey") || "Key"}</TableHead>
                                                      <TableHead>{t("entitlements.features.valueType")}</TableHead>
                                                      <TableHead>{t("entitlements.features.defaultValue")}</TableHead>
                                                      <TableHead>{t("entitlements.overrides.source")}</TableHead>
                                                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                                                </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                                {vm.paginatedResolved.map((f) => (
                                                      <TableRow key={f.featureId}>
                                                            <TableCell className="font-medium">
                                                                  {language === "ar" ? f.nameAr : f.nameEn}
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
                                                                              {f.effectiveValue === "true" ? t("tenant.enabled") : t("tenants.disabled")}
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
                                                            <TableCell className="text-right">
                                                                  <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                              vm.openSetOverride(f.featureId, f.key, f.valueType, f.effectiveValue)
                                                                        }
                                                                  >
                                                                        <Pencil className="h-4 w-4 mr-1" />
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
      return (
            <Card>
                  <CardHeader>
                        <CardTitle>{t("entitlements.overrides.title")}</CardTitle>
                        <CardDescription>{t("entitlements.overrides.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                        {vm.overrides.length === 0 ? (
                              <p className="text-center text-muted-foreground py-8">
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
                                                      <TableHead className="text-right">{t("common.actions")}</TableHead>
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
                                                                              {o.value === "true" ? t("tenant.enabled") : t("tenants.disabled")}
                                                                        </Badge>
                                                                  ) : (
                                                                        <span className="font-semibold">{o.value}</span>
                                                                  )}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">
                                                                  {o.reason || "—"}
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                  {format(new Date(o.createdAt), "MMM d, yyyy")}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                  <div className="flex gap-1 justify-end">
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
                                                                              title={t("entitlements.overrides.setCost") || "Set Cost"}
                                                                              onClick={() => vm.openCostDialog(o.id)}
                                                                        >
                                                                              <DollarSign className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                              variant="ghost"
                                                                              size="sm"
                                                                              className="text-destructive"
                                                                              onClick={() => vm.removeOverride(o.featureId)}
                                                                              disabled={vm.isRemoving}
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
                                    <Label className="text-xs text-muted-foreground">
                                          {t("entitlements.features.featureName")}
                                    </Label>
                                    <p className="font-mono text-sm mt-1">{vm.editingFeature?.featureName}</p>
                              </div>

                              <div className="space-y-2">
                                    <Label>{t("entitlements.features.defaultValue")}</Label>
                                    {vm.editingFeature?.valueType === "Boolean" ? (
                                          <div className="flex items-center gap-2">
                                                <Switch
                                                      checked={vm.overrideValue === "true"}
                                                      onCheckedChange={(checked) =>
                                                            vm.setOverrideValue(checked ? "true" : "false")
                                                      }
                                                />
                                                <span className="text-sm">
                                                      {vm.overrideValue === "true" ? t("tenant.enabled") : t("tenants.disabled")}
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
                              <Button onClick={vm.submitOverride} disabled={vm.isSaving}>
                                    {vm.isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
            <Dialog open={!!vm.costOverrideId} onOpenChange={(open) => { if (!open) vm.closeCostDialog(); }}>
                  <DialogContent className="max-w-sm">
                        <DialogHeader>
                              <DialogTitle>{t("entitlements.overrides.setCost") || "Set Cost Adjustment"}</DialogTitle>
                              <DialogDescription>
                                    {t("entitlements.overrides.setCostDesc") || "Assign a monthly USD cost for this override."}
                              </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                              <div className="space-y-2">
                                    <Label>{t("entitlements.overrides.costAmount") || "Amount (USD)"}</Label>
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
                                    <Label>{t("entitlements.overrides.costReason") || "Reason (optional)"}</Label>
                                    <Textarea
                                          value={vm.costReason}
                                          onChange={(e) => vm.setCostReason(e.target.value)}
                                          placeholder={t("entitlements.overrides.costReasonPlaceholder") || "e.g. Extra admin seats surcharge"}
                                          rows={2}
                                    />
                              </div>
                        </div>
                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.closeCostDialog()} disabled={vm.isSavingCost}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button
                                    onClick={() => vm.submitCost()}
                                    disabled={!vm.costAmount || vm.isSavingCost}
                              >
                                    {vm.isSavingCost
                                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving") || "Saving..."}</>
                                          : (t("common.save") || "Save")
                                    }
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ============================================
 * PAGINATION BAR
 * ============================================ */

function PaginationBar({ page, totalPages, setPage, t }: {
      page: number; totalPages: number; setPage: (p: number) => void; t: TFn;
}) {
      if (totalPages <= 1) return null;
      return (
            <div className="flex items-center justify-between border-t pt-3 mt-3">
                  <p className="text-sm text-muted-foreground">
                        {t("common.page") || "Page"} {page} / {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                              {t("common.previous") || "Previous"}
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                              {t("common.next") || "Next"}
                        </Button>
                  </div>
            </div>
      );
}
