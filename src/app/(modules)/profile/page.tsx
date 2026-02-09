import { Metadata } from 'next';
import { ModuleErrorBoundary } from '@core/ui/module-error-boundary';
import { ProfileView } from '@modules/user/src/presentation/views/ProfileView';

export const metadata: Metadata = {
      title: 'Profile | Verified',
      description: 'View and update your account profile and preferences',
};

export default function ProfilePage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Profile">
                        <ProfileView />
                  </ModuleErrorBoundary>
            </main>
      );
}
