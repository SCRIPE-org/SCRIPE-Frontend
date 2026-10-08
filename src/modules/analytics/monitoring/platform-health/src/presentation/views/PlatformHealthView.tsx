"use client";

import React from "react";
import { usePlatformHealthViewModel } from "../viewmodels/usePlatformHealthViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardDescription, CardTitle } from "@core/ui/card";
import { ShieldAlert } from "lucide-react";
import { HealthHeader } from "../components/HealthHeader";
import { HealthTopKpiCards } from "../components/HealthTopKpiCards";
import { CoreServicesGrid } from "../components/CoreServicesGrid";
import { ApiPerformanceTelemetry } from "../components/ApiPerformanceTelemetry";
import { InfrastructureHealthSection } from "../components/InfrastructureHealthSection";
import { ExternalDependenciesSection } from "../components/ExternalDependenciesSection";
import { RecentIncidentsSection } from "../components/RecentIncidentsSection";
import { IncidentDetailPanel } from "../components/IncidentDetailPanel";

export function PlatformHealthView() {
  const {
    health,
    isLoading,
    isRefetching,
    refetch,
    autoRefresh,
    setAutoRefresh,
    timeRange,
    setTimeRange,
    selectedIncidentId,
    selectedIncident,
    setSelectedIncidentId,
    isAuthorized,
  } = usePlatformHealthViewModel();
  const { t } = useI18n();

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full text-center p-6 space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-xl">
            {t("platformHealth.forbidden.title") || "Access Restricted"}
          </CardTitle>
          <CardDescription>
            {t("platformHealth.forbidden.description") ||
              "Platform Observability is strictly restricted to global Platform SuperAdmins with observability.view permission."}
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-10 select-none">
      {/* 1. Header with Time Range, Live Toggle & Refresh */}
      <HealthHeader
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        isRefetching={isRefetching}
        refetch={refetch}
        status={health?.status ?? "Healthy"}
      />

      {/* 2. Top Summary KPI Cards (Overall Health, Uptime, Health Score, Active Incidents) */}
      <HealthTopKpiCards health={health}  />

      {/* 3. Core Services Health & API Performance Telemetry */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <CoreServicesGrid
            modules={health?.modules}
            checks={health?.checks}
            
          />
        </div>
        <div className="xl:col-span-1">
          <ApiPerformanceTelemetry
            health={health}
            timeRange={timeRange}
            
          />
        </div>
      </div>

      {/* 4. Infrastructure Health & External Dependencies */}
      <div className="space-y-5">
        <InfrastructureHealthSection
          infrastructure={health?.infrastructure}
          checks={health?.checks}
          
        />
        <ExternalDependenciesSection
          dependencies={health?.externalDependencies}
          
        />
      </div>

      {/* 5. Recent Incidents & Degradations + Incident Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <RecentIncidentsSection
            incidents={health?.incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            
          />
        </div>
        <div className="lg:col-span-5">
          <IncidentDetailPanel
            incident={selectedIncident} isLoading={isLoading}
            
          />
        </div>
      </div>
    </div>
  );
}
