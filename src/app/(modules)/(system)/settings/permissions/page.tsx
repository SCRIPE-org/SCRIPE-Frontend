import { Metadata } from 'next';
import { ModuleErrorBoundary } from '@core/ui/module-error-boundary';
import { PermissionsView } from '@modules/system/permissions';

export const metadata: Metadata = {
      title: 'Permissions | Verified',
      description: 'View and manage system-wide permission definitions',
};

export default function PermissionsPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Permission Management">
                        <PermissionsView />
                  </ModuleErrorBoundary>
            </main>
      );
}
