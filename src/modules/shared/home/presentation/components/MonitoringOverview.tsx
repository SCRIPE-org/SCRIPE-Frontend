"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  RefreshCw,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { usePlatformCommandCenterViewModel } from "../viewmodels/usePlatformCommandCenterViewModel";

type CommandCenter = ReturnType<typeof usePlatformCommandCenterViewModel>;

function formatWhen(
  timestamp: string,
  t: ReturnType<typeof useI18n>["t"]
) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  if (Number.isNaN(diffMs) || diffMs < 60_000) return t("platformCommandCenter.monitoringOverview.justNow");
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return t("platformCommandCenter.monitoringOverview.minutesAgo", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("platformCommandCenter.monitoringOverview.hoursAgo", { count: hours });
  return t("platformCommandCenter.monitoringOverview.daysAgo", { count: Math.floor(hours / 24) });
}

function SectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>{t("platformCommandCenter.monitoringOverview.sectionError")}</span>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {t("platformCommandCenter.monitoringOverview.retry")}
      </Button>
    </div>
  );
}

export function MonitoringOverview({ vm }: { vm: CommandCenter }) {
  const { t } = useI18n();
  const summary = vm.summary;
  const health = vm.health;
  const summaryError = vm.overviewVm.summary.isError;
  const activityError = vm.overviewVm.recentActivity.isError;
  const healthError = Boolean(vm.healthVm.error);

  const degraded =
    (health?.isDegraded ?? false) ||
    vm.kpis.degradedCount > 0 ||
    health?.infrastructure?.database?.isConnected === false;

  const statusLabel = !health
    ? t("platformCommandCenter.monitoringOverview.unknown")
    : degraded
      ? t("platformCommandCenter.monitoringOverview.degraded")
      : t("platformCommandCenter.monitoringOverview.operational");

  const inactiveTenants =
    summary != null ? Math.max(0, summary.totalTenants - summary.activeTenants) : null;

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 pb-8">
      <header className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {t("platformCommandCenter.monitoringOverview.eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {t("platformCommandCenter.monitoringOverview.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("platformCommandCenter.monitoringOverview.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${degraded ? "bg-amber-500" : health ? "bg-primary" : "bg-muted-foreground"}`}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
          {vm.isLive ? (
            <span className="text-xs text-muted-foreground">
              {t("platformCommandCenter.monitoringOverview.live")}
            </span>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={() => vm.refetchAll()} disabled={vm.isRefreshing}>
            <RefreshCw className={`me-1.5 h-3.5 w-3.5 ${vm.isRefreshing ? "animate-spin" : ""}`} />
            {t("platformCommandCenter.monitoringOverview.refresh")}
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label={t("platformCommandCenter.monitoringOverview.tenants")}
          value={summaryError ? "—" : String(vm.kpis.totalTenants)}
          hint={
            summary
              ? t("platformCommandCenter.kpis.activeTenantsRatio", {
                  active: summary.activeTenants,
                  total: summary.totalTenants,
                })
              : undefined
          }
          icon={Building2}
          loading={vm.isLoading && !summary}
          emphasize
        />
        <Kpi
          label={t("platformCommandCenter.monitoringOverview.admins")}
          value={summaryError ? "—" : String(vm.kpis.totalAdmins)}
          hint={
            summary
              ? t("platformCommandCenter.kpis.activeAdminsRatio", {
                  active: summary.activeAdmins,
                  total: summary.totalAdmins,
                })
              : undefined
          }
          icon={Users}
          loading={vm.isLoading && !summary}
        />
        <Kpi
          label={t("platformCommandCenter.monitoringOverview.failedLogins")}
          value={summaryError ? "—" : String(vm.kpis.failedLogins24h)}
          hint={t("platformCommandCenter.monitoringOverview.failedLoginsHint")}
          icon={ShieldAlert}
          href="/security"
          loading={vm.isLoading && !summary}
        />
        <Kpi
          label={t("platformCommandCenter.kpis.serviceHealth")}
          value={healthError ? "—" : vm.kpis.overallHealthStatus}
          hint={health ? vm.kpis.overallHealthScore : undefined}
          icon={Activity}
          href="/platform-health"
          loading={vm.healthVm.isLoading && !health}
        />
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title={t("platformCommandCenter.monitoringOverview.statusTitle")}>
          {healthError ? (
            <SectionError onRetry={() => vm.healthVm.refetch()} />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {health
                  ? degraded
                    ? t("platformCommandCenter.monitoringOverview.statusDegradedBody")
                    : t("platformCommandCenter.monitoringOverview.statusHealthyBody")
                  : t("platformCommandCenter.monitoringOverview.statusUnknownBody")}
              </p>
              {health?.infrastructure ? (
                <dl className="mt-4 space-y-2 text-sm">
                  <Signal
                    label={t("platformCommandCenter.monitoringOverview.database")}
                    ok={health.infrastructure.database?.isConnected === true}
                    detail={
                      health.infrastructure.database?.latencyMs != null
                        ? `${health.infrastructure.database.latencyMs} ms`
                        : undefined
                    }
                  />
                  <Signal
                    label={t("platformCommandCenter.monitoringOverview.cache")}
                    ok={health.infrastructure.redis?.isConnected === true}
                    detail={health.infrastructure.redis?.mode}
                  />
                  {health.modules ? (
                    <Signal
                      label={t("platformCommandCenter.monitoringOverview.modules")}
                      ok={vm.kpis.degradedCount === 0}
                      detail={`${health.modules.length - vm.kpis.degradedCount}/${health.modules.length}`}
                    />
                  ) : null}
                </dl>
              ) : null}
              <Link href="/platform-health" className="mt-4 inline-block text-sm text-primary">
                {t("platformCommandCenter.monitoringOverview.viewHealth")}
              </Link>
            </>
          )}
        </Panel>

        <Panel title={t("platformCommandCenter.monitoringOverview.attentionTitle")}>
          {summaryError && healthError ? (
            <SectionError onRetry={() => vm.refetchAll()} />
          ) : vm.attentionAlerts.length === 0 ? (
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("platformCommandCenter.monitoringOverview.noIssues")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("platformCommandCenter.monitoringOverview.noIssuesBody")}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {vm.attentionAlerts.map((alert) => (
                <li key={alert.id}>
                  <Link href={alert.href} className="block">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.subtitle}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          title={t("platformCommandCenter.monitoringOverview.activityTitle")}
          action={
            <Link href="/audit" className="text-xs text-primary">
              {t("platformCommandCenter.monitoringOverview.viewAudit")}
            </Link>
          }
        >
          {activityError ? (
            <SectionError onRetry={() => vm.overviewVm.recentActivity.refetch()} />
          ) : vm.recentChanges.length === 0 ? (
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("platformCommandCenter.monitoringOverview.noActivity")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("platformCommandCenter.monitoringOverview.noActivityBody")}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {vm.recentChanges.slice(0, 6).map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {event.entityType ? `${event.eventType} · ${event.entityType}` : event.eventType}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {event.username || event.endpoint || "—"}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatWhen(event.timestamp, t)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("platformCommandCenter.monitoringOverview.footprintTitle")}>
          {summaryError ? (
            <SectionError onRetry={() => vm.overviewVm.summary.refetch()} />
          ) : (
            <dl className="grid grid-cols-2 gap-3">
              <Foot label={t("platformCommandCenter.monitoringOverview.tenants")} value={vm.kpis.totalTenants} />
              <Foot label={t("platformCommandCenter.monitoringOverview.active")} value={vm.kpis.activeTenants} />
              <Foot
                label={t("platformCommandCenter.monitoringOverview.inactive")}
                value={inactiveTenants ?? 0}
              />
              {vm.regionNodes.length > 0 ? (
                <Foot
                  label={t("platformCommandCenter.monitoringOverview.regions")}
                  value={vm.regionNodes.length}
                />
              ) : null}
            </dl>
          )}
        </Panel>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-foreground">
          {t("platformCommandCenter.monitoringOverview.exploreTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Dest href="/platform-health" title={t("platformCommandCenter.monitoringOverview.healthTitle")} body={t("platformCommandCenter.monitoringOverview.healthBody")} icon={Activity} />
          <Dest href="/analytics" title={t("platformCommandCenter.monitoringOverview.analyticsTitle")} body={t("platformCommandCenter.monitoringOverview.analyticsBody")} icon={Building2} />
          <Dest href="/audit" title={t("platformCommandCenter.monitoringOverview.auditTitle")} body={t("platformCommandCenter.monitoringOverview.auditBody")} icon={ScrollText} />
          <Dest href="/security" title={t("platformCommandCenter.monitoringOverview.securityTitle")} body={t("platformCommandCenter.monitoringOverview.securityBody")} icon={ShieldCheck} />
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  href,
  loading,
  emphasize,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Activity;
  href?: string;
  loading?: boolean;
  emphasize?: boolean;
}) {
  const body = (
    <div className={`rounded-lg border bg-card p-4 ${emphasize ? "border-primary/40" : "border-border"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      {loading ? (
        <div className="mt-3 h-7 w-16 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      )}
      {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Signal({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end text-foreground">
        {ok
          ? t("platformCommandCenter.monitoringOverview.operationalSignal")
          : t("platformCommandCenter.monitoringOverview.unavailable")}
        {detail ? <span className="ms-2 text-muted-foreground">{detail}</span> : null}
      </dd>
    </div>
  );
}

function Foot({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function Dest({
  href,
  title,
  body,
  icon: Icon,
}: {
  href: string;
  title: string;
  body: string;
  icon: typeof Activity;
}) {
  return (
    <Link href={href} className="rounded-lg border border-border bg-card p-4 hover:border-primary/40">
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </Link>
  );
}
