/**
 * Subscriptions View
 *
 * Tenant-scoped view showing subscription history with assign/change/revoke actions.
 */
"use client";

import { useSubscriptionsViewModel } from "../viewmodels/useSubscriptionsViewModel";
import { useEditionsViewModel } from "@modules/entitlements/editions/src/presentation/viewmodels/useEditionsViewModel";
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
import {
      Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@core/ui/select";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Loader2, Plus, RefreshCw, XCircle } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionsViewProps {
      tenantId: string;
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      Active: "default",
      Trialing: "secondary",
      Canceled: "destructive",
      Expired: "outline",
};

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
      Lifetime: "default",
      Monthly: "secondary",
      Yearly: "secondary",
      Trial: "outline",
};

export function SubscriptionsView({ tenantId }: SubscriptionsViewProps) {
      const { t } = useI18n();
      const vm = useSubscriptionsViewModel(tenantId);
      const editionsVm = useEditionsViewModel();

      if (vm.isLoading) {
            return (
                  <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      const activeSubscription = vm.subscriptions.find((s) => s.status === "Active" || s.status === "Trialing");

      return (
            <div className="space-y-6">
                  <div className="flex items-center justify-between">
                        <div>
                              <h2 className="text-2xl font-bold tracking-tight">{t("entitlements.subscriptions.title")}</h2>
                              <p className="text-muted-foreground">{t("entitlements.subscriptions.description")}</p>
                        </div>
                        <div className="flex gap-2">
                              {activeSubscription && (
                                    <Button
                                          variant="outline"
                                          onClick={() => vm.setShowChangeDialog(true)}
                                    >
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          {t("entitlements.subscriptions.change")}
                                    </Button>
                              )}
                              {!activeSubscription && (
                                    <Button onClick={() => vm.setShowAssignDialog(true)}>
                                          <Plus className="h-4 w-4 mr-2" />
                                          {t("entitlements.subscriptions.assign")}
                                    </Button>
                              )}
                        </div>
                  </div>

                  <Card>
                        <CardHeader>
                              <CardTitle>{t("entitlements.subscriptions.title")}</CardTitle>
                              <CardDescription>{t("entitlements.subscriptions.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              {vm.subscriptions.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                          {t("entitlements.subscriptions.noSubscriptions")}
                                    </p>
                              ) : (
                                    <Table>
                                          <TableHeader>
                                                <TableRow>
                                                      <TableHead>{t("entitlements.editions.editionName")}</TableHead>
                                                      <TableHead>{t("tenants.subscriptionType")}</TableHead>
                                                      <TableHead>{t("common.status")}</TableHead>
                                                      <TableHead>{t("common.createdAt")}</TableHead>
                                                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                                                </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                                {vm.subscriptions.map((sub) => (
                                                      <TableRow key={sub.id}>
                                                            <TableCell className="font-medium">{sub.editionName}</TableCell>
                                                            <TableCell>
                                                                  <Badge variant={TYPE_VARIANTS[sub.type] ?? "outline"}>
                                                                        {t(`entitlements.subscriptions.${sub.type.toLowerCase()}`) || sub.type}
                                                                  </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                  <Badge variant={STATUS_VARIANTS[sub.status] ?? "outline"}>
                                                                        {t(`entitlements.subscriptions.${sub.status.toLowerCase()}`) || sub.status}
                                                                  </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                  {format(new Date(sub.startDate), "MMM d, yyyy")}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                  {(sub.status === "Active" || sub.status === "Trialing") && (
                                                                        <Button
                                                                              variant="ghost"
                                                                              size="sm"
                                                                              className="text-destructive"
                                                                              onClick={() => vm.revokeSubscription(sub.id)}
                                                                              disabled={vm.isRevoking}
                                                                        >
                                                                              <XCircle className="h-4 w-4 mr-1" />
                                                                              {t("entitlements.subscriptions.revoke")}
                                                                        </Button>
                                                                  )}
                                                            </TableCell>
                                                      </TableRow>
                                                ))}
                                          </TableBody>
                                    </Table>
                              )}
                        </CardContent>
                  </Card>

                  {/* Assign Edition Dialog */}
                  <Dialog open={vm.showAssignDialog} onOpenChange={vm.setShowAssignDialog}>
                        <DialogContent>
                              <DialogHeader>
                                    <DialogTitle>{t("entitlements.subscriptions.assign")}</DialogTitle>
                                    <DialogDescription>{t("entitlements.subscriptions.assignDesc")}</DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <Label>{t("entitlements.editions.editionName")}</Label>
                                          <Select value={vm.selectedEditionId} onValueChange={vm.setSelectedEditionId}>
                                                <SelectTrigger>
                                                      <SelectValue placeholder={t("entitlements.editions.editionName")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      {(editionsVm.items ?? []).map((ed) => (
                                                            <SelectItem key={ed.id} value={ed.id}>
                                                                  {ed.displayNameEn || ed.name}
                                                            </SelectItem>
                                                      ))}
                                                </SelectContent>
                                          </Select>
                                    </div>

                                    <div className="space-y-2">
                                          <Label>{t("tenants.subscriptionType")}</Label>
                                          <Select value={vm.subscriptionType} onValueChange={vm.setSubscriptionType}>
                                                <SelectTrigger>
                                                      <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      <SelectItem value="Lifetime">{t("entitlements.subscriptions.base")}</SelectItem>
                                                      <SelectItem value="Trial">{t("entitlements.subscriptions.trial")}</SelectItem>
                                                      <SelectItem value="Monthly">{t("entitlements.subscriptions.base")}</SelectItem>
                                                      <SelectItem value="Yearly">{t("entitlements.subscriptions.base")}</SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>

                                    {(vm.subscriptionType === "Trial" || vm.subscriptionType === "Monthly" || vm.subscriptionType === "Yearly") && (
                                          <div className="space-y-2">
                                                <Label>{t("common.selectDate")}</Label>
                                                <Input
                                                      type="date"
                                                      value={vm.endDate}
                                                      onChange={(e) => vm.setEndDate(e.target.value)}
                                                />
                                          </div>
                                    )}
                              </div>

                              <DialogFooter>
                                    <Button variant="outline" onClick={() => vm.setShowAssignDialog(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button
                                          onClick={vm.submitAssign}
                                          disabled={!vm.selectedEditionId || vm.isAssigning}
                                    >
                                          {vm.isAssigning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                          {t("entitlements.subscriptions.assign")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>

                  {/* Change Edition Dialog */}
                  <Dialog open={vm.showChangeDialog} onOpenChange={vm.setShowChangeDialog}>
                        <DialogContent>
                              <DialogHeader>
                                    <DialogTitle>{t("entitlements.subscriptions.change")}</DialogTitle>
                                    <DialogDescription>{t("entitlements.subscriptions.changeDesc")}</DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <Label>{t("entitlements.editions.editionName")}</Label>
                                          <Select value={vm.selectedEditionId} onValueChange={vm.setSelectedEditionId}>
                                                <SelectTrigger>
                                                      <SelectValue placeholder={t("entitlements.editions.editionName")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      {(editionsVm.items ?? []).map((ed) => (
                                                            <SelectItem key={ed.id} value={ed.id}>
                                                                  {ed.displayNameEn || ed.name}
                                                            </SelectItem>
                                                      ))}
                                                </SelectContent>
                                          </Select>
                                    </div>
                              </div>

                              <DialogFooter>
                                    <Button variant="outline" onClick={() => vm.setShowChangeDialog(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button
                                          onClick={vm.submitChange}
                                          disabled={!vm.selectedEditionId || vm.isChanging}
                                    >
                                          {vm.isChanging && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                          {t("entitlements.subscriptions.change")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}
