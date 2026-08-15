// FILE-EXCEPTION: file length
/**
 * Webhook Detail View
 *
 * Detail page with tabs: Overview, Delivery Log, Analytics, Dead Letters.
 * Pure UI — all logic in useWebhookDetailViewModel.
 */
"use client";

import { useWebhookDetailViewModel } from "../viewmodels/useWebhookDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { INTEGRATIONS_PERMISSIONS } from "@modules/integrations/permission-constants";
import { WebhookStatusBadge } from "../components/WebhookStatusBadge";
import { WebhookSecretPanel } from "../components/WebhookSecretPanel";
import { WebhookAnalyticsChart } from "../components/WebhookAnalyticsChart";
import { DeadLetterQueue } from "../components/DeadLetterQueue";

import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Skeleton } from "@core/ui/skeleton";
import { PageHeader } from "@core/ui/page-header";
import { DetailRow } from "@core/ui/detail-row";
import { EmptyState } from "@core/ui/empty-state";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import {
  ArrowLeft,
  Webhook as WebhookIcon,
  Globe,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Zap,
  AlertTriangle,
  BarChart3,
  Skull,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTimeUtc, formatDateUtc } from "@core/common/utils";
import { DeleteWebhookDialog } from "../components/DeleteWebhookDialog";
import { TestPingButton } from "../components/TestPingButton";
import { WebhookStatsCards } from "../components/WebhookStatsCards";
import { DeliveryLogTable } from "../components/DeliveryLogTable";
import { WebhookForm } from "../components/WebhookForm";

interface WebhookDetailViewProps {
  webhookId: string;
}

// Scope is read through our own locale keys rather than the domain entity's
// `scopeLabel` getter, which returns English text baked into the entity —
// this view stays bilingual by construction instead of depending on a
// domain-layer string.
const SCOPE_LABEL_KEYS: Record<string, string> = {
  platform_only: "webhooks.scope.platformOnly",
  all_tenants: "webhooks.scope.allTenants",
  tenant_only: "webhooks.scope.tenantOnly",
  tenant_with_children: "webhooks.scope.tenantWithChildren",
};

/**
 * Presentation UI component rendering the webhook detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhookDetailView({ webhookId }: WebhookDetailViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const vm = useWebhookDetailViewModel(webhookId);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Backend enforcement was always intact (Test/Toggle/Update/RotateSecret/ReplayDeadLetter
  // all carry [PermissionRequired("webhooks.update")], Delete carries "webhooks.delete") —
  // this page's controls previously rendered and were enabled purely off local UI state, with
  // zero permission gating of their own. Computed once here and passed down to this view's
  // own actions plus the secret panel and dead-letter queue below.
  const canUpdate = usePermission(INTEGRATIONS_PERMISSIONS.WEBHOOKS_UPDATE);
  const canDelete = usePermission(INTEGRATIONS_PERMISSIONS.WEBHOOKS_DELETE);

  // ─── Loading state ────────────────────────────────────────
  if (vm.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton shape="circle" className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton shape="title" className="w-64" />
            <Skeleton shape="text" className="w-96" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-nx-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-nx-lg" />
      </div>
    );
  }

  // ─── Error / Not found ────────────────────────────────────
  if (vm.error || !vm.webhook) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <EmptyState
          bare
          size="lg"
          icon={AlertTriangle}
          title={t("webhooks.notFound")}
          description={vm.error?.message || t("webhooks.notFoundDesc")}
          action={
            <Button variant="outline" onClick={() => router.push("/integrations/webhooks")}>
              <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
              {t("common.back")}
            </Button>
          }
        />
      </div>
    );
  }

  const webhook = vm.webhook;
  const isAutoDisabled = webhook.isAutoDisabled;
  const scopeLabelKey = SCOPE_LABEL_KEYS[webhook.scope];

  return (
    <Tabs
      value={vm.activeTab}
      onValueChange={vm.setActiveTab}
      className="flex flex-col"
      style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}
    >
      {/* ─── Header ──────────────────────────────────────────── */}
      <PageHeader
        className="mb-0"
        icon={WebhookIcon}
        eyebrow={
          <Button variant="ghost" size="sm" onClick={() => router.push("/integrations/webhooks")}>
            <ArrowLeft className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("common.back")}
          </Button>
        }
        title={webhook.description || t("webhooks.untitled")}
        badges={<WebhookStatusBadge isActive={webhook.isActive} isAutoDisabled={isAutoDisabled} />}
        meta={[
          { label: t("common.created"), value: formatDateTimeUtc(webhook.createdAt) },
          {
            label: t("webhooks.lastDelivery"),
            value: webhook.lastDeliveryAt ? formatDateUtc(webhook.lastDeliveryAt) : "—",
          },
        ]}
        actions={
          <>
            {canUpdate && (
              <TestPingButton
                onTest={vm.testPing}
                isTesting={vm.isTesting}
                testResult={vm.testResult}
                onDismiss={vm.clearTestResult}
              />
            )}
            {canUpdate && (
              <Button variant="outline" size="sm" onClick={vm.toggle} loading={vm.isToggling}>
                {!vm.isToggling &&
                  (webhook.isActive ? (
                    <ToggleRight className="me-1.5 h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <ToggleLeft className="me-1.5 h-4 w-4" aria-hidden="true" />
                  ))}
                {webhook.isActive ? t("webhooks.deactivate") : t("webhooks.activate")}
              </Button>
            )}
            {canUpdate && (
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Pencil className="me-1.5 h-4 w-4" aria-hidden="true" />
                {t("common.edit")}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="me-1.5 h-4 w-4" aria-hidden="true" />
                {t("common.delete")}
              </Button>
            )}
          </>
        }
        tabs={
          <TabsList>
            <TabsTrigger value="overview">{t("webhooks.overview")}</TabsTrigger>
            <TabsTrigger value="deliveries">
              {t("webhooks.deliveryLog")}
              {vm.deliveryTotalCount > 0 && (
                <Badge variant="secondary" className="ms-1.5 h-5 min-w-[20px] px-1.5 text-xs">
                  {vm.deliveryTotalCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              {t("webhooks.analytics.tab")}
            </TabsTrigger>
            <TabsTrigger value="dead-letters" className="gap-1.5">
              <Skull className="h-3.5 w-3.5" aria-hidden="true" />
              {t("webhooks.deadLetters.tab")}
              {vm.deadLetterTotalCount > 0 && (
                <Badge variant="destructive" className="ms-1 h-5 min-w-[20px] px-1.5 text-xs">
                  {vm.deadLetterTotalCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        }
      />

      {/* ─── Endpoint identity ───────────────────────────────── */}
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-4">
        <DetailRow
          icon={Globe}
          label={t("webhooks.url")}
          value={webhook.url}
          mono
          copyable={webhook.url}
        />
      </div>

      {/* ─── Auto-disabled Warning ───────────────────────────── */}
      {isAutoDisabled && (
        <Alert variant="warning">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>{t("webhooks.autoDisabledTitle")}</AlertTitle>
          <AlertDescription>{t("webhooks.autoDisabledGeneric")}</AlertDescription>
        </Alert>
      )}

      {/* ─── Stats Cards ─────────────────────────────────────── */}
      <WebhookStatsCards webhook={webhook} />

      {/* ─── Overview Tab ─────────────────────────────────── */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Events Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" aria-hidden="true" />
                {t("webhooks.subscribedEvents")}
              </CardTitle>
              <CardDescription>{t("webhooks.subscribedEventsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {webhook.events.map((event) => (
                  <div key={event} className="flex flex-col items-start gap-0.5">
                    <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs">
                      <Zap className="h-2.5 w-2.5 text-warning" aria-hidden="true" />
                      {(t(`webhooks.eventNames.${event}`) || event) as string}
                    </Badge>
                    <span className="px-1 font-mono text-[10px] text-nx-ink-3">{event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("webhooks.configuration")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow
                  layout="stacked"
                  label={t("webhooks.maxRetries")}
                  value={webhook.maxRetries}
                />
                <DetailRow
                  layout="stacked"
                  label={t("webhooks.maxConsecutiveFailures")}
                  value={`${webhook.maxConsecutiveFailures} ${t("webhooks.consecutiveFailuresLabel")}`}
                />
                <DetailRow
                  layout="stacked"
                  label={t("webhooks.currentFailures")}
                  value={webhook.consecutiveFailures}
                  valueClassName={webhook.consecutiveFailures > 0 ? "text-warning" : "text-success"}
                />
                <DetailRow
                  layout="stacked"
                  label={t("webhooks.lastStatus")}
                  value={webhook.lastDeliveryStatus || "—"}
                />
                <DetailRow
                  layout="stacked"
                  label={t("webhooks.scope.label")}
                  value={
                    <Badge variant="outline" className="text-xs">
                      {scopeLabelKey ? t(scopeLabelKey) : webhook.scope}
                    </Badge>
                  }
                />
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
          canRotate={canUpdate}
        />
      </TabsContent>

      {/* ─── Delivery Log Tab ──────────────────────────────── */}
      <TabsContent value="deliveries">
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
      <TabsContent value="analytics">
        <WebhookAnalyticsChart analytics={vm.analytics} isLoading={vm.isLoadingAnalytics} />
      </TabsContent>

      {/* ─── Dead Letters Tab (Phase 7) ─────────────────────── */}
      <TabsContent value="dead-letters">
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
          canReplay={canUpdate}
        />
      </TabsContent>

      {/* ─── Edit Dialog ─────────────────────────────────────── */}
      <WebhookForm
        mode="edit"
        webhook={webhook}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => setEditDialogOpen(false)}
      />

      {/* ─── Delete Confirmation ─────────────────────────────── */}
      <DeleteWebhookDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={vm.remove}
        isLoading={vm.isDeleting}
      />
    </Tabs>
  );
}
