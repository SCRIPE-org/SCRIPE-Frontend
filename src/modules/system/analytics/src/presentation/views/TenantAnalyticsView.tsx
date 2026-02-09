'use client';

/**
 * Tenant Analytics View
 *
 * Pure UI composition — tenant KPIs, distribution pie, login comparison chart.
 */
import { useTenantAnalyticsViewModel } from '../viewmodels/useTenantAnalyticsViewModel';
import { useI18n } from '@core/providers/i18n-provider';
import { TenantMetricsCards } from '../components/TenantMetricsCards';
import { AdminDistributionPie } from '../components/AdminDistributionPie';
import { LoginComparisonChart } from '../components/LoginComparisonChart';
import { BarChart3 } from 'lucide-react';

export function TenantAnalyticsView() {
      const vm = useTenantAnalyticsViewModel();
      const { t } = useI18n();

      return (
            <div className="space-y-6">
                  {/* Page Header */}
                  <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                              <BarChart3 className="h-6 w-6" />
                              {t('tenantAnalytics.title')}
                        </h1>
                        <p className="text-muted-foreground">{t('tenantAnalytics.subtitle')}</p>
                  </div>

                  {/* KPI Cards */}
                  <TenantMetricsCards
                        data={vm.metrics.data}
                        isLoading={vm.metrics.isLoading}
                        error={vm.metrics.error}
                        onRetry={() => vm.metrics.refetch()}
                  />

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AdminDistributionPie
                              data={vm.distribution.data ?? []}
                              isLoading={vm.distribution.isLoading}
                              error={vm.distribution.error}
                              onRetry={() => vm.distribution.refetch()}
                        />
                        <LoginComparisonChart
                              data={vm.comparison.data ?? []}
                              isLoading={vm.comparison.isLoading}
                              error={vm.comparison.error}
                              onRetry={() => vm.comparison.refetch()}
                        />
                  </div>
            </div>
      );
}
