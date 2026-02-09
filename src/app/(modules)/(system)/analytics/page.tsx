import { Metadata } from 'next';
import { TenantAnalyticsView } from '@modules/system/analytics';

export const metadata: Metadata = {
      title: 'Tenant Analytics | Verified',
      description: 'Performance metrics and comparison across tenants',
};

export default function AnalyticsPage() {
      return (
            <main>
                  <TenantAnalyticsView />
            </main>
      );
}
