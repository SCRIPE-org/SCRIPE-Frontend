import { Metadata } from 'next';
import { ModuleErrorBoundary } from '@core/ui/module-error-boundary';
import { TenantAnalyticsView } from '@modules/system/analytics';

export const metadata: Metadata = {
      title: 'Tenant Analytics | Verified',
      description: 'Performance metrics and comparison across tenants',
};

export default function AnalyticsPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Tenant Analytics">
                        <TenantAnalyticsView />
                  </ModuleErrorBoundary>
            </main>
      );
}
