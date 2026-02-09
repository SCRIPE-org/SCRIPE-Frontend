import { Metadata } from 'next';
import { ModuleErrorBoundary } from '@core/ui/module-error-boundary';
import { HomeView } from '@modules/home';

export const metadata: Metadata = {
      title: 'Overview | Verified',
      description: 'System overview with quick stats, navigation, and recent activity',
};

export default function HomePage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Overview">
                        <HomeView />
                  </ModuleErrorBoundary>
            </main>
      );
}
