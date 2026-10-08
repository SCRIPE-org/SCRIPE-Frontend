"use client";

/**
 * Security Dashboard View (Platform Security Posture & Activity Console)
 *
 * Professional platform-grade operational console.
 * Strictly adheres to SCRIPE architecture and design system.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { useSecurityDashboardViewModel } from "../viewmodels/useSecurityDashboardViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useDashboardTheme, DashboardStudioPanel } from "@modules/monitoring/core";
import { SecurityHeader } from "../components/SecurityHeader";
import { SecurityPostureKpiCards } from "../components/SecurityPostureKpiCards";
import { SecurityTrendsChart } from "../components/SecurityTrendsChart";
import { SecurityAttentionPanel } from "../components/SecurityAttentionPanel";
import { AuthMethodsPosture } from "../components/AuthMethodsPosture";
import { ActiveSessionsTable } from "../components/ActiveSessionsTable";
import { SecurityPoliciesCard } from "../components/SecurityPoliciesCard";
import { RecentSecurityEventsTable } from "../components/RecentSecurityEventsTable";
import { EventDetailsDrawer } from "../components/EventDetailsDrawer";
import type { SecurityChange, SecurityAttentionSignal } from "../../domain/entities/SecurityEntities";

// Lazy-load report export dialog
const ReportExportDialog = dynamic(
  () => import("@core/ui/report-export-dialog").then((m) => ({ default: m.ReportExportDialog })),
  { ssr: false }
);

/**
 * SecurityDashboardView
 */
export function SecurityDashboardView() {
  useModuleLocales(() => import("../../../locales"), "security");

  const vm = useSecurityDashboardViewModel();
  const theme = useDashboardTheme();
  const { cardClasses } = theme;

  const [exportOpen, setExportOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityChange | null>(null);

  const handleSelectSignal = (signal: SecurityAttentionSignal) => {
    // If signal corresponds to an audit event, construct a detail representation
    setSelectedEvent({
      id: signal.id,
      eventType: signal.type,
      httpMethod: null,
      endpoint: null,
      entityType: "SecurityEvent",
      entityId: null,
      username: signal.actor || null,
      isAdmin: false,
      ipAddress: signal.ipAddress || null,
      isSuccess: signal.status === "success",
      errorMessage: signal.description,
      timestamp: signal.timestamp,
      tenantId: null,
    });
  };

  return (
    <div className="w-full space-y-5 pb-10 select-none">
      {/* 1. Header with Time Horizon, Posture Status, Refresh & Actions */}
      <SecurityHeader
        timeRange={vm.timeRange}
        setTimeRange={vm.setTimeRange}
        isRefetching={vm.isRefetching}
        onRefresh={vm.refetchAll}
        status={vm.kpis.securityStatus}
        statusLabel={vm.kpis.statusLabel}
        onOpenExport={() => setExportOpen(true)}
        onOpenStudio={() => theme.setIsStudioOpen(true)}
      />

      {/* 2. Security Posture KPI Strip */}
      <SecurityPostureKpiCards
        kpis={vm.kpis}
        isLoading={vm.isLoading}
        cardClasses={cardClasses}
      />

      {/* 3. Trends & Attention Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <SecurityTrendsChart
            data={vm.loginActivity}
            isLoading={vm.isLoading}
            onRetry={vm.refetchAll}
            cardClasses={cardClasses}
          />
        </div>
        <div className="lg:col-span-5">
          <SecurityAttentionPanel
            signals={vm.attentionSignals}
            isLoading={vm.isLoading}
            onRetry={vm.refetchAll}
            cardClasses={cardClasses}
            onSelectSignal={handleSelectSignal}
          />
        </div>
      </div>

      {/* 4. Authentication Methods & Active Sessions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5">
          <AuthMethodsPosture
            methods={vm.authMethods}
            cardClasses={cardClasses}
          />
        </div>
        <div className="lg:col-span-7">
          <ActiveSessionsTable
            sessions={vm.activeSessions}
            isLoading={vm.isLoading}
            onRevokeSession={vm.revokeSession}
            isRevoking={vm.isRevoking}
            onRetry={vm.refetchAll}
            cardClasses={cardClasses}
          />
        </div>
      </div>

      {/* 5. Security Policies Posture & Recent Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5">
          <SecurityPoliciesCard
            policies={vm.securityPolicies}
            cardClasses={cardClasses}
          />
        </div>
        <div className="lg:col-span-7">
          <RecentSecurityEventsTable
            events={vm.recentChanges}
            isLoading={vm.isLoading}
            onSelectEvent={setSelectedEvent}
            onRetry={vm.refetchAll}
            cardClasses={cardClasses}
          />
        </div>
      </div>

      {/* Event Details Drawer for Investigation */}
      <EventDetailsDrawer
        event={selectedEvent}
        open={Boolean(selectedEvent)}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />

      {/* Report Export Dialog */}
      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={vm.exportEndpoint}
        titleKey="export.security.title"
        descriptionKey="export.security.description"
      />

      {/* Dashboard Studio Panel */}
      <DashboardStudioPanel
        open={theme.isStudioOpen}
        onClose={() => theme.setIsStudioOpen(false)}
        draft={theme.draft}
        onUpdateNested={theme.updateNested}
        onSave={theme.saveDraft}
        onDiscard={theme.discardDraft}
        onReset={theme.resetToDefault}
        isSaving={theme.isSaving}
        onBuilderCanvasChange={(canvas) => theme.updateDraft("builderCanvas", canvas)}
      />
    </div>
  );
}
