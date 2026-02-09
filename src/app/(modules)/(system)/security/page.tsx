import { Metadata } from 'next';
import { SecurityDashboardView } from '@modules/system/security';

export const metadata: Metadata = {
      title: 'Security Dashboard | Verified',
      description: 'Monitor security threats, failed logins, and blocked IPs',
};

export default function SecurityPage() {
      return (
            <main>
                  <SecurityDashboardView />
            </main>
      );
}
