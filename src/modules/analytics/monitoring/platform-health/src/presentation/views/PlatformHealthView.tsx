"use client";

import { usePlatformHealthViewModel } from "../viewmodels/usePlatformHealthViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { PageHeader } from "@core/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  Layers,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export function PlatformHealthView() {
  const {
    health,
    isLoading,
    isRefetching,
    refetch,
    autoRefresh,
    setAutoRefresh,
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
              "Platform Observability is strictly restricted to global Platform SuperAdmins."}
          </CardDescription>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Healthy":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("platformHealth.statusHealthy") || "Healthy"}
          </Badge>
        );
      case "Degraded":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t("platformHealth.statusDegraded") || "Degraded"}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1">
            <XCircle className="h-3.5 w-3.5" />
            {t("platformHealth.statusUnhealthy") || "Unhealthy"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Activity}
        title={t("platformHealth.title") || "Platform Health & Observability"}
        description={
          t("platformHealth.subtitle") ||
          "Real-time CLR runtime telemetry, infrastructure dependency latencies, and registered module matrix"
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-xs"
            >
              {autoRefresh
                ? t("platformHealth.autoRefresh") || "Auto-Refresh ON"
                : t("platformHealth.autoRefresh") || "Auto-Refresh (10s)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              {t("platformHealth.refresh") || "Refresh"}
            </Button>
          </div>
        }
      />

      {/* Global Status Banner */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Server className="h-6 w-6 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Overall Platform Health
              </div>
              <div className="text-lg font-semibold flex items-center gap-2">
                SCRIPE Operational Kernel
                {getStatusBadge(health?.status ?? "Healthy")}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {t("platformHealth.lastChecked") || "Last sampled"}:{" "}
            {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "—"}
          </div>
        </CardContent>
      </Card>

      {/* Section 1: CLR Runtime Vitals */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          {t("platformHealth.sections.runtime") || "CLR Runtime Vitals"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("platformHealth.runtime.uptime") || "Process Uptime"}</CardDescription>
              <CardTitle className="text-2xl font-bold">{health?.runtime?.uptime || "—"}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {t("platformHealth.runtime.startedAt") || "Started"}:{" "}
              {health?.runtime?.processStartTime
                ? new Date(health.runtime.processStartTime).toLocaleString()
                : "—"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("platformHealth.runtime.heapMemory") || "Managed Heap"}</CardDescription>
              <CardTitle className="text-2xl font-bold">
                {health?.runtime?.managedHeapFormatted || "—"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Working Set: {health?.runtime?.workingSetFormatted || "—"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("platformHealth.runtime.threadPool") || "Active Workers"}</CardDescription>
              <CardTitle className="text-2xl font-bold">
                {health?.runtime?.threadPoolActiveWorkers ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Available: {health?.runtime?.threadPoolAvailableWorkers ?? "—"} /{" "}
              {health?.runtime?.threadPoolMaxWorkers ?? "—"} max
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("platformHealth.runtime.gcCollections") || "GC Counts"}</CardDescription>
              <CardTitle className="text-2xl font-bold">
                {health?.runtime
                  ? `${health.runtime.gcGen0Collections} / ${health.runtime.gcGen1Collections} / ${health.runtime.gcGen2Collections}`
                  : "—"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground truncate">
              {health?.runtime?.clrVersion || "CLR"}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Infrastructure Latencies */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          {t("platformHealth.sections.infrastructure") || "Infrastructure Latencies"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  {t("platformHealth.infrastructure.database") || "Relational Database"}
                </CardTitle>
                {getStatusBadge(health?.infrastructure?.database?.status ?? "Healthy")}
              </div>
              <CardDescription>
                Provider: {health?.infrastructure?.database?.provider || "Relational"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("platformHealth.infrastructure.latency") || "Ping Latency"}:</span>
                <span className="font-semibold">{health?.infrastructure?.database?.latencyMs ?? 0} ms</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("platformHealth.infrastructure.status") || "Connection"}:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {health?.infrastructure?.database?.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                  {t("platformHealth.infrastructure.redis") || "Redis Distributed Cache"}
                </CardTitle>
                {getStatusBadge(health?.infrastructure?.redis?.status ?? "Healthy")}
              </div>
              <CardDescription>
                Mode: {health?.infrastructure?.redis?.mode || "InMemory fallback"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("platformHealth.infrastructure.latency") || "Ping Latency"}:</span>
                <span className="font-semibold">{health?.infrastructure?.redis?.latencyMs ?? 0} ms</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("platformHealth.infrastructure.status") || "Connection"}:</span>
                <span className="font-semibold">
                  {health?.infrastructure?.redis?.isConnected ? "Active" : "Standalone / Memory"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Registered Module Matrix */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          {t("platformHealth.sections.modules") || "Registered Module Matrix"} (
          {health?.modules?.length ?? 12})
        </h3>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="px-4 py-3">{t("platformHealth.modules.name") || "Module"}</th>
                  <th className="px-4 py-3">{t("platformHealth.modules.route") || "Route Prefix"}</th>
                  <th className="px-4 py-3">{t("platformHealth.modules.version") || "Version"}</th>
                  <th className="px-4 py-3">{t("platformHealth.modules.status") || "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {health?.modules && health.modules.length > 0 ? (
                  health.modules.map((mod) => (
                    <tr key={mod.name} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{mod.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {mod.routePrefix}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{mod.version}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                          In-Process
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No modules registered
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
