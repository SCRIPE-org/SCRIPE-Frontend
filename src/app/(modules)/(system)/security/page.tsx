import { Metadata } from 'next';
import { ModuleErrorBoundary } from '@core/ui/module-error-boundary';
import { SecurityDashboardView } from '@modules/system/security';

export const metadata: Metadata = {
      title: 'Security Dashboard | Verified',
      description: 'Monitor security threats, failed logins, and blocked IPs',
};

export default function SecurityPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Security Dashboard">
                        <SecurityDashboardView />
                  </ModuleErrorBoundary>
            </main>
      );
}
