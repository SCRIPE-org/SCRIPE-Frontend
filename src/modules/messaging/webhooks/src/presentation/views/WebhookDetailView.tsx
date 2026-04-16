/**
 * Webhook Detail View
 *
 * Detail page with tabs: Overview, Delivery Log, Analytics, Dead Letters.
 * Pure UI — all logic in useWebhookDetailViewModel.
 */
"use client";

import { useWebhookDetailViewModel } from "../viewmodels/useWebhookDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { WebhookStatusBadge } from "../components/WebhookStatusBadge";
import { WebhookSecretPanel } from "../components/WebhookSecretPanel";
import { WebhookAnalyticsChart } from "../components/WebhookAnalyticsChart";
import { DeadLetterQueue } from "../components/DeadLetterQueue";

import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Skeleton } from "@core/ui/skeleton";
import {
      ArrowLeft,
      Globe,
      ToggleLeft,
      ToggleRight,
      Pencil,
      Trash2,
      Zap,
      Clock,
      AlertTriangle,
      Copy,
      Check,
      BarChart3,
      Skull,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { format } from "date-fns";
import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
} from "@core/ui/alert-dialog";
import { TestPingButton } from "../components/TestPingButton";
import { WebhookStatsCards } from "../components/WebhookStatsCards";
import { DeliveryLogTable } from "../components/DeliveryLogTable";
import { WebhookForm } from "../components/WebhookForm";

interface WebhookDetailViewProps {
      webhookId: string;
}

export function WebhookDetailView({ webhookId }: WebhookDetailViewProps) {
      const { t } = useI18n();
      const router = useRouter();
      const vm = useWebhookDetailViewModel(webhookId);

      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [copiedUrl, setCopiedUrl] = useState(false);

      const handleCopyUrl = useCallback(() => {
            if (vm.webhook?.url) {
                  navigator.clipboard.writeText(vm.webhook.url);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
            }
      }, [vm.webhook?.url]);

      // ─── Loading state ────────────────────────────────────────
      if (vm.isLoading) {
            return (
                  <div className="space-y-6 p-6">
                        <div className="flex items-center gap-4">
                              <Skeleton className="h-10 w-10 rounded-lg" />
                              <div className="space-y-2">
                                    <Skeleton className="h-6 w-64" />
                                    <Skeleton className="h-4 w-96" />
                              </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                              {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-28 rounded-xl" />
                              ))}
                        </div>
                        <Skeleton className="h-96 rounded-xl" />
                  </div>
            );
      }

      // ─── Error / Not found ────────────────────────────────────
      if (vm.error || !vm.webhook) {
            return (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                        <AlertTriangle className="h-16 w-16 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">
                              {t("webhooks.notFound") || "Webhook Not Found"}
                        </h2>
                        <p className="text-muted-foreground">
                              {vm.error?.message || t("webhooks.notFoundDesc") || "The requested webhook could not be found."}
                        </p>
                        <Button variant="outline" onClick={() => router.push("/messaging/webhooks")}>
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              {t("common.back") || "Back"}
                        </Button>
                  </div>
            );
      }

      const webhook = vm.webhook;
      const isAutoDisabled = webhook.isAutoDisabled;

      return (
            <div className="space-y-6">
                  {/* ─── Header ──────────────────────────────────────────── */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mt-1 shrink-0"
                                    onClick={() => router.push("/messaging/webhooks")}
                              >
                                    <ArrowLeft className="h-4 w-4" />
                              </Button>

                              <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                          <h1 className="text-2xl font-bold tracking-tight">
                                                {webhook.description || t("webhooks.untitled") || "Untitled Webhook"}
                                          </h1>
                                          <WebhookStatusBadge
                                                isActive={webhook.isActive}
                                                isAutoDisabled={isAutoDisabled}
                                          />
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Globe className="h-3.5 w-3.5" />
                                          <code className="text-xs bg-muted px-2 py-0.5 rounded-md max-w-[400px] truncate">
                                                {webhook.url}
                                          </code>
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleCopyUrl}
                                          >
                                                {copiedUrl ? (
                                                      <Check className="h-3 w-3 text-emerald-500" />
                                                ) : (
                                                      <Copy className="h-3 w-3" />
                                                )}
                                          </Button>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          <span>
                                                {t("common.created") || "Created"}{" "}
                                                {format(new Date(webhook.createdAt), "MMM d, yyyy 'at' HH:mm")}
                                          </span>
                                          {webhook.lastDeliveryAt && (
                                                <>
                                                      <span>•</span>
                                                      <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {t("webhooks.lastDelivery") || "Last delivery"}{" "}
                                                            {format(new Date(webhook.lastDeliveryAt), "MMM d, HH:mm")}
                                                      </span>
                                                </>
                                          )}
                                    </div>
                              </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                              <TestPingButton
                                    onTest={vm.testPing}
                                    isTesting={vm.isTesting}
                                    testResult={vm.testResult}
                                    onDismiss={vm.clearTestResult}
                              />

                              <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={vm.toggle}
                                    disabled={vm.isToggling}
                              >
                                    {webhook.isActive ? (
                                          <ToggleRight className="h-4 w-4 mr-1.5 text-emerald-500" />
                                    ) : (
                                          <ToggleLeft className="h-4 w-4 mr-1.5" />
                                    )}
                                    {webhook.isActive
                                          ? t("webhooks.deactivate") || "Deactivate"
                                          : t("webhooks.activate") || "Activate"}
                              </Button>

                              <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditDialogOpen(true)}
                              >
                                    <Pencil className="h-4 w-4 mr-1.5" />
                                    {t("common.edit") || "Edit"}
                              </Button>

                              <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    onClick={() => setDeleteDialogOpen(true)}
                              >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    {t("common.delete") || "Delete"}
                              </Button>
                        </div>
                  </div>

                  {/* ─── Auto-disabled Warning ───────────────────────────── */}
                  {isAutoDisabled && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                              <div className="text-sm">
                                    <p className="font-medium text-amber-800 dark:text-amber-300">
                                          {t("webhooks.autoDisabledTitle") || "Webhook Auto-Disabled"}
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-400">
                                          {t("webhooks.autoDisabledGeneric") ||
                                                "This webhook was automatically disabled due to consecutive delivery failures. Click 'Activate' to re-enable."}
                                    </p>
                              </div>
                        </div>
                  )}

                  {/* ─── Stats Cards ─────────────────────────────────────── */}
                  <WebhookStatsCards webhook={webhook} />

                  {/* ─── Tabs ─────────────────────────────────────────────── */}
                  <Tabs value={vm.activeTab} onValueChange={vm.setActiveTab}>
                        <TabsList className="bg-muted/50">
                              <TabsTrigger value="overview">
                                    {t("webhooks.overview") || "Overview"}
                              </TabsTrigger>
                              <TabsTrigger value="deliveries">
                                    {t("webhooks.deliveryLog") || "Delivery Log"}
                                    {vm.deliveryTotalCount > 0 && (
                                          <Badge variant="secondary" className="ml-1.5 text-xs h-5 min-w-[20px] px-1.5">
                                                {vm.deliveryTotalCount}
                                          </Badge>
                                    )}
                              </TabsTrigger>
                              <TabsTrigger value="analytics" className="gap-1.5">
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    {t("webhooks.analytics.tab") || "Analytics"}
                              </TabsTrigger>
                              <TabsTrigger value="dead-letters" className="gap-1.5">
                                    <Skull className="h-3.5 w-3.5" />
                                    {t("webhooks.deadLetters.tab") || "Dead Letters"}
                                    {vm.deadLetterTotalCount > 0 && (
                                          <Badge variant="destructive" className="ml-1 text-xs h-5 min-w-[20px] px-1.5">
                                                {vm.deadLetterTotalCount}
                                          </Badge>
                                    )}
                              </TabsTrigger>
                        </TabsList>

                        {/* ─── Overview Tab ─────────────────────────────────── */}
                        <TabsContent value="overview" className="space-y-6 mt-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Events Card */}
                                    <Card>
                                          <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                      <Zap className="h-4 w-4 text-amber-500" />
                                                      {t("webhooks.subscribedEvents") || "Subscribed Events"}
                                                </CardTitle>
                                                <CardDescription>
                                                      {t("webhooks.subscribedEventsDesc") ||
                                                            "Events that trigger this webhook"}
                                                </CardDescription>
                                          </CardHeader>
                                          <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                      {webhook.events.map((event) => (
                                                            <div
                                                                  key={event}
                                                                  className="flex flex-col items-start gap-0.5"
                                                            >
                                                                  <Badge
                                                                        variant="outline"
                                                                        className="text-xs px-2.5 py-1 gap-1.5"
                                                                  >
                                                                        <Zap className="h-2.5 w-2.5 text-amber-500" />
                                                                        {(t(`webhooks.eventNames.${event}`) || event) as string}
                                                                  </Badge>
                                                                  <span className="text-[10px] font-mono text-muted-foreground px-1">
                                                                        {event}
                                                                  </span>
                                                            </div>
                                                      ))}
                                                </div>
                                          </CardContent>
                                    </Card>

                                    {/* Configuration Card */}
                                    <Card>
                                          <CardHeader>
                                                <CardTitle className="text-base">
                                                      {t("webhooks.configuration") || "Configuration"}
                                                </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                      <div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                  {t("webhooks.maxRetries") || "Max Retries"}
                                                            </p>
                                                            <p className="text-sm font-medium">{webhook.maxRetries}</p>
                                                      </div>
                                                      <div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                  {t("webhooks.maxConsecutiveFailures") ||
                                                                        "Auto-disable After"}
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                  {webhook.maxConsecutiveFailures}{" "}
                                                                  {t("webhooks.consecutiveFailuresLabel") || "failures"}
                                                            </p>
                                                      </div>
                                                      <div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                  {t("webhooks.currentFailures") || "Current Failures"}
                                                            </p>
                                                            <p
                                                                  className={`text-sm font-medium ${webhook.consecutiveFailures > 0
                                                                              ? "text-amber-600"
                                                                              : "text-emerald-600"
                                                                        }`}
                                                            >
                                                                  {webhook.consecutiveFailures}
                                                            </p>
                                                      </div>
                                                      <div>
                                                            <p className="text-xs text-muted-foreground mb-1">
                                                                  {t("webhooks.lastStatus") || "Last Status"}
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                  {webhook.lastDeliveryStatus || "—"}
                                                            </p>
                                                      </div>
                                                </div>
                                          </CardContent>
                                    </Card>
                              </div>

                              {/* Secret Panel */}
                              <WebhookSecretPanel
                                    secret={webhook.secret}
                                    hasPreviousSecret={webhook.hasPreviousSecret}
                                    previousSecretExpiresAt={webhook.previousSecretExpiresAt}
                                    isVisible={vm.isSecretVisible}
                                    onToggleVisibility={vm.toggleSecretVisibility}
                                    onRotate={vm.rotateSecret}
                                    isRotating={vm.isRotating}
                              />
                        </TabsContent>

                        {/* ─── Delivery Log Tab ──────────────────────────────── */}
                        <TabsContent value="deliveries" className="mt-6">
                              <DeliveryLogTable
                                    logs={vm.deliveryLogs}
                                    page={vm.deliveryPage}
                                    pageSize={vm.deliveryPageSize}
                                    totalCount={vm.deliveryTotalCount}
                                    onPageChange={vm.setDeliveryPage}
                                    filter={vm.deliveryFilter}
                                    onFilterChange={vm.setDeliveryFilter}
                                    isLoading={vm.isLoadingDeliveries}
                              />
                        </TabsContent>

                        {/* ─── Analytics Tab (Phase 7) ────────────────────────── */}
                        <TabsContent value="analytics" className="mt-6">
                              <WebhookAnalyticsChart
                                    analytics={vm.analytics}
                                    isLoading={vm.isLoadingAnalytics}
                              />
                        </TabsContent>

                        {/* ─── Dead Letters Tab (Phase 7) ─────────────────────── */}
                        <TabsContent value="dead-letters" className="mt-6">
                              <DeadLetterQueue
                                    logs={vm.deadLetters}
                                    page={vm.dlqPage}
                                    pageSize={vm.dlqPageSize}
                                    totalCount={vm.deadLetterTotalCount}
                                    onPageChange={vm.setDlqPage}
                                    onReplay={vm.replayDeadLetter}
                                    onReplayAll={vm.replayAllDeadLetters}
                                    isReplaying={vm.isReplaying}
                                    isReplayingAll={vm.isReplayingAll}
                                    isLoading={vm.isLoadingDeadLetters}
                              />
                        </TabsContent>
                  </Tabs>

                  {/* ─── Edit Dialog ─────────────────────────────────────── */}
                  <WebhookForm
                        mode="edit"
                        webhook={webhook}
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        onSuccess={() => setEditDialogOpen(false)}
                  />

                  {/* ─── Delete Confirmation ─────────────────────────────── */}
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent>
                              <AlertDialogHeader>
                                    <AlertDialogTitle>
                                          {t("webhooks.deleteConfirmTitle") || "Delete Webhook"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                          {t("webhooks.deleteConfirmDesc") ||
                                                "This will permanently delete this webhook subscription and all its delivery logs. This action cannot be undone."}
                                    </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                    <AlertDialogCancel>
                                          {t("common.cancel") || "Cancel"}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => {
                                                vm.remove();
                                                setDeleteDialogOpen(false);
                                          }}
                                    >
                                          {t("common.delete") || "Delete"}
                                    </AlertDialogAction>
                              </AlertDialogFooter>
                        </AlertDialogContent>
                  </AlertDialog>
            </div>
      );
}
