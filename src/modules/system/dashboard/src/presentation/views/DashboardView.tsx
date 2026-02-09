'use client';

/**
 * Dashboard View
 *
 * Pure UI composition with permission-gated sections.
 * All logic lives in useDashboardViewModel.
 * Real-time updates via SignalR.
 *
 * Route-level guard: PAGE_PERMISSIONS["/dashboard"] = [DASHBOARD_VIEW]
 * Section-level guard: Security sections require SECURITY_VIEW
 */
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';
import { useDashboardRealtime } from '../viewmodels/useDashboardRealtime';
import { useI18n } from '@core/providers/i18n-provider';
import { usePermission } from '@core/hooks/use-permission';
import { SYSTEM_PERMISSIONS } from '@core/common/types/permissions';
import { KPICardsSection } from '../components/KPICardsSection';
import { LoginActivityChart } from '../components/LoginActivityChart';
import { EventDistributionChart } from '../components/EventDistributionChart';
import { RecentChangesSection } from '../components/RecentChangesSection';
import { SecurityEventsSection } from '../components/SecurityEventsSection';
import { BlockedIPsSection } from '../components/BlockedIPsSection';
import { Badge } from '@core/ui/badge';
import { Radio } from 'lucide-react';

const connectionColors = {
      connected: 'bg-emerald-500',
      connecting: 'bg-amber-500 animate-pulse',
      reconnecting: 'bg-amber-500 animate-pulse',
      disconnected: 'bg-red-500',
} as const;

export function DashboardView() {
      const hasSecurityPerm = usePermission(SYSTEM_PERMISSIONS.SECURITY_VIEW);
      const vm = useDashboardViewModel(hasSecurityPerm);
      const { connectionState } = useDashboardRealtime();
      const { t } = useI18n();

      return (
            <div className="space-y-6">
                  {/* Page Header */}
                  <div className="flex items-start justify-between">
                        <div>
                              <h1 className="text-2xl font-bold tracking-tight">
                                    {t('dashboard.title')}
                              </h1>
                              <p className="text-muted-foreground">
                                    {t('dashboard.subtitle')}
                              </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1.5 text-xs">
                              <span className={`h-2 w-2 rounded-full ${connectionColors[connectionState]}`} />
                              <Radio className="h-3 w-3" aria-hidden="true" />
                              {t(`audit.realtime.${connectionState}`)}
                        </Badge>
                  </div>

                  {/* KPI Cards Row */}
                  <KPICardsSection
                        data={vm.summary.data}
                        isLoading={vm.summary.isLoading}
                        error={vm.summary.error}
                        onRetry={() => vm.summary.refetch()}
                  />

                  {/* Charts Row: Login Activity + Event Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                              <LoginActivityChart
                                    data={vm.loginActivity.data ?? []}
                                    isLoading={vm.loginActivity.isLoading}
                                    error={vm.loginActivity.error}
                                    onRetry={() => vm.loginActivity.refetch()}
                              />
                        </div>
                        <div>
                              <EventDistributionChart
                                    data={vm.eventDistribution.data ?? []}
                                    isLoading={vm.eventDistribution.isLoading}
                                    error={vm.eventDistribution.error}
                                    onRetry={() => vm.eventDistribution.refetch()}
                              />
                        </div>
                  </div>

                  {/* Bottom Row: Recent Changes + Security (permission-gated) */}
                  <div className={`grid grid-cols-1 ${vm.hasSecurityPermission ? 'lg:grid-cols-2' : ''} gap-6`}>
                        <RecentChangesSection
                              data={vm.recentChanges.data ?? []}
                              isLoading={vm.recentChanges.isLoading}
                              error={vm.recentChanges.error}
                              onRetry={() => vm.recentChanges.refetch()}
                        />
                        {vm.hasSecurityPermission && (
                              <SecurityEventsSection
                                    data={vm.securityEvents.data ?? []}
                                    isLoading={vm.securityEvents.isLoading}
                                    error={vm.securityEvents.error}
                                    onRetry={() => vm.securityEvents.refetch()}
                              />
                        )}
                  </div>

                  {/* Blocked IPs — security.view required */}
                  {vm.hasSecurityPermission && (
                        <BlockedIPsSection
                              data={vm.topBlockedIPs.data ?? []}
                              isLoading={vm.topBlockedIPs.isLoading}
                              error={vm.topBlockedIPs.error}
                              onRetry={() => vm.topBlockedIPs.refetch()}
                        />
                  )}
            </div>
      );
}
