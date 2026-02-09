import { Metadata } from 'next';
import { ModuleErrorBoundary } from '@core/ui/module-error-boundary';
import { AuditView } from '@modules/system/audit';

export const metadata: Metadata = {
      title: 'Audit Log | Verified',
      description: 'View and search the complete audit trail of all system events',
};

export default function AuditPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Audit Log">
                        <AuditView />
                  </ModuleErrorBoundary>
            </main>
      );
}
