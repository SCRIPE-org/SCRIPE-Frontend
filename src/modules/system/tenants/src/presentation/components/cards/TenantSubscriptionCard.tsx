"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { CreditCard, Pencil, Loader2 } from "lucide-react";
import { useTenantSubscriptionViewModel } from "@modules/system/tenants/src/presentation/viewmodels/useTenantSubscriptionViewModel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Skeleton } from "@core/ui/skeleton";

interface TenantSubscriptionCardProps {
      tenantId: string;
}

export function TenantSubscriptionCard({ tenantId }: TenantSubscriptionCardProps) {
      const { t } = useI18n();
      const vm = useTenantSubscriptionViewModel(tenantId);
      const [editOpen, setEditOpen] = useState(false);
      const [selectedEditionId, setSelectedEditionId] = useState<string>("");

      if (vm.isLoading) {
            return (
                  <Card>
                        <CardHeader className="space-y-2">
                              <Skeleton className="h-6 w-1/3" />
                              <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                              <Skeleton className="h-10 w-full" />
                        </CardContent>
                  </Card>
            );
      }

      const { subscription, availableEditions } = vm;

      const handleEditOpen = () => {
            setSelectedEditionId(subscription?.editionId || "");
            setEditOpen(true);
      };

      const handleSave = () => {
            if (selectedEditionId) {
                  vm.changeEdition(selectedEditionId);
                  setEditOpen(false);
            }
      };

      // Find current edition to display its name properly
      const currentEdition = availableEditions.find(e => e.id === subscription?.editionId);

      return (
            <>
                  <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                          <CreditCard className="h-4 w-4" />
                                          {t("tenant.subscriptionPlan") || "Subscription Plan"}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("tenant.subscriptionPlanDesc") || "Manage the active edition and subscription details for this tenant."}
                                    </CardDescription>
                              </div>
                              <Button variant="ghost" size="sm" onClick={handleEditOpen}>
                                    <Pencil className="h-4 w-4" />
                              </Button>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                              {subscription ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">{t("tenant.currentPlan") || "Current Plan"}</label>
                                                <div className="text-lg font-bold">{subscription.editionName || currentEdition?.name || t("tenant.unknownPlan") || "Unknown"}</div>
                                          </div>
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">{t("tenant.status") || "Status"}</label>
                                                <div>
                                                      <Badge variant={subscription.status.toLowerCase() === "active" ? "success" : "secondary"}>
                                                            {subscription.status}
                                                      </Badge>
                                                </div>
                                          </div>
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">{t("tenant.startDate") || "Start Date"}</label>
                                                <div className="text-base font-medium">
                                                      {new Date(subscription.startDate).toLocaleDateString()}
                                                </div>
                                          </div>
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">{t("tenant.endDate") || "End Date"}</label>
                                                <div className="text-base font-medium">
                                                      {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : t("tenant.never") || "Never"}
                                                </div>
                                          </div>
                                    </div>
                              ) : (
                                    <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center text-muted-foreground border border-dashed rounded-lg">
                                          <CreditCard className="h-8 w-8 opacity-50" />
                                          <p>{t("tenant.noSubscription") || "This tenant does not have an active subscription."}</p>
                                          <Button variant="outline" size="sm" onClick={handleEditOpen}>
                                                {t("tenant.assignPlan") || "Assign Plan"}
                                          </Button>
                                    </div>
                              )}
                        </CardContent>
                  </Card>

                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>{t("tenant.changeSubscriptionPlan") || "Change Subscription Plan"}</DialogTitle>
                                    <DialogDescription>
                                          {t("tenant.changeSubscriptionPlanDesc") || "Select a new edition to assign to this tenant. This will take effect immediately."}
                                    </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <label className="text-sm font-medium">{t("tenant.selectPlan") || "Select Plan"}</label>
                                          <Select value={selectedEditionId} onValueChange={setSelectedEditionId}>
                                                <SelectTrigger>
                                                      <SelectValue placeholder={t("tenant.selectAPlan") || "Select a plan"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      {availableEditions.map((edition) => (
                                                            <SelectItem key={edition.id} value={edition.id}>
                                                                  {edition.name}
                                                            </SelectItem>
                                                      ))}
                                                      {availableEditions.length === 0 && (
                                                            <SelectItem value="empty" disabled>
                                                                  {vm.isEditionsLoading ? (t("common.loading") || "Loading...") : (t("tenant.noEditionsAvailable") || "No editions available")}
                                                            </SelectItem>
                                                      )}
                                                </SelectContent>
                                          </Select>
                                    </div>
                              </div>

                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditOpen(false)} disabled={vm.isChanging}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button onClick={handleSave} disabled={!selectedEditionId || vm.isChanging}>
                                          {vm.isChanging ? (
                                                <>
                                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                      {t("common.saving") || "Saving..."}
                                                </>
                                          ) : (
                                                t("common.save") || "Save"
                                          )}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </>
      );
}
