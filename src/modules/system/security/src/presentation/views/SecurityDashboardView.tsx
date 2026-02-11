'use client';

/**
 * Security Dashboard View
 *
 * Pure UI composition — security monitoring with threat cards, heatmap, blocked IPs, timeline.
 * Includes export functionality with interval-based date selection.
 */
import { useState } from 'react';
import { useSecurityDashboardViewModel } from '../viewmodels/useSecurityDashboardViewModel';
import { useI18n } from '@core/providers/i18n-provider';
import { ThreatSummaryCards } from '../components/ThreatSummaryCards';
import { FailedLoginsHeatmap } from '../components/FailedLoginsHeatmap';
import { BlockedIPsTable } from '../components/BlockedIPsTable';
import { SecurityTimeline } from '../components/SecurityTimeline';
import { ReportExportDialog } from '@core/ui/report-export-dialog';
import { API_ENDPOINTS } from '@core/config/api-endpoints';
import { Button } from '@core/ui/button';
import { Shield, FileDown } from 'lucide-react';

export function SecurityDashboardView() {
      const vm = useSecurityDashboardViewModel();
      const { t } = useI18n();
      const [exportOpen, setExportOpen] = useState(false);

      return (
            <div className="space-y-6">
                  {/* Page Header */}
                  <div className="flex items-start justify-between">
                        <div>
                              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    <Shield className="h-6 w-6" />
                                    {t('security.title')}
                              </h1>
                              <p className="text-muted-foreground">{t('security.subtitle')}</p>
                        </div>
                        <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExportOpen(true)}
                              className="gap-1.5"
                        >
                              <FileDown className="h-4 w-4" />
                              {t('export.button')}
                        </Button>
                  </div>

                  {/* Threat Summary Cards */}
                  <ThreatSummaryCards
                        data={vm.threats.data}
                        isLoading={vm.threats.isLoading}
                        error={vm.threats.error}
                        onRetry={() => vm.threats.refetch()}
                  />

                  {/* Charts + Timeline Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FailedLoginsHeatmap
                              data={vm.failedLogins.data}
                              isLoading={vm.failedLogins.isLoading}
                              error={vm.failedLogins.error}
                              onRetry={() => vm.failedLogins.refetch()}
                        />
                        <SecurityTimeline
                              data={vm.timeline.data ?? []}
                              isLoading={vm.timeline.isLoading}
                              error={vm.timeline.error}
                              onRetry={() => vm.timeline.refetch()}
                        />
                  </div>

                  {/* Blocked IPs Table */}
                  <BlockedIPsTable
                        data={vm.blockedIPs.data ?? []}
                        isLoading={vm.blockedIPs.isLoading}
                        error={vm.blockedIPs.error}
                        onRetry={() => vm.blockedIPs.refetch()}
                  />

                  {/* Export Dialog */}
                  <ReportExportDialog
                        open={exportOpen}
                        onClose={() => setExportOpen(false)}
                        endpoint={API_ENDPOINTS.DASHBOARD.EXPORT_SECURITY}
                        titleKey="export.security.title"
                        descriptionKey="export.security.description"
                  />
            </div>
      );
}
