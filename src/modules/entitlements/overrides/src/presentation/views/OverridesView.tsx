/**
 * Feature Overrides View
 *
 * Tenant-scoped view showing:
 * 1. Current overrides table with remove action
 * 2. Resolved features table with set-override action
 * 3. Set-override dialog with value + reason fields
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
import { Loader2, Trash2, Pencil, Shield, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { format } from "date-fns";

interface OverridesViewProps {
      tenantId: string;
}

const SOURCE_BADGES: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      Default: "outline",
      Edition: "secondary",
      Override: "default",
};

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

                        {/* Resolved Features Tab */}
                        <TabsContent value="resolved">
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{t("entitlements.overrides.resolvedFeatures")}</CardTitle>
                                          <CardDescription>{t("entitlements.overrides.resolvedDesc")}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                          {vm.resolvedFeatures.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-8">
                                                      {t("common.noResults")}
                                                </p>
                                          ) : (
                                                <Table>
                                                      <TableHeader>
                                                            <TableRow>
                                                                  <TableHead>{t("entitlements.features.featureName")}</TableHead>
                                                                  <TableHead>{t("entitlements.features.valueType")}</TableHead>
                                                                  <TableHead>{t("entitlements.features.defaultValue")}</TableHead>
                                                                  <TableHead>{t("entitlements.overrides.source")}</TableHead>
                                                                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                                                            </TableRow>
                                                      </TableHeader>
                                                      <TableBody>
                                                            {vm.resolvedFeatures.map((f) => (
                                                                  <TableRow key={f.featureId}>
                                                                        <TableCell>
                                                                              <span className="font-mono text-xs">{f.name}</span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                              <Badge variant="outline">{f.valueType}</Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                              {f.valueType === "Boolean" ? (
                                                                                    <Badge variant={f.effectiveValue === "true" ? "default" : "secondary"}>
                                                                                          {f.effectiveValue === "true" ? t("tenants.enabled") : t("tenants.disabled")}
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
                                                                                          vm.openSetOverride(f.featureId, f.name, f.valueType, f.effectiveValue)
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
                                          )}
                                    </CardContent>
                              </Card>
                        </TabsContent>

                        {/* Current Overrides Tab */}
                        <TabsContent value="overrides">
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
                                                            {vm.overrides.map((o) => (
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
                                                                                          {o.value === "true" ? t("tenants.enabled") : t("tenants.disabled")}
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
                                          )}
                                    </CardContent>
                              </Card>
                        </TabsContent>
                  </Tabs>

                  {/* Set Override Dialog */}
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
                                                            {vm.overrideValue === "true" ? t("tenants.enabled") : t("tenants.disabled")}
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
                                    <Button onClick={() => vm.submitOverride()} disabled={vm.isSaving}>
                                          {vm.isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                          {t("common.save")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}
