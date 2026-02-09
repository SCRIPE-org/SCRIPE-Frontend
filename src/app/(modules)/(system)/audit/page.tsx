import { Metadata } from 'next';
import { AuditView } from '@modules/system/audit';

export const metadata: Metadata = {
      title: 'Audit Log | Verified',
      description: 'View and search the complete audit trail',
};

export default function AuditPage() {
      return (
            <main>
                  <AuditView />
            </main>
      );
}
