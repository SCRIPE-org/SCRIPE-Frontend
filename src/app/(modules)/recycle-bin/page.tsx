import { Metadata } from 'next';
import { RecycleBinView } from '@modules/system/recycle-bin';

export const metadata: Metadata = {
      title: 'Recycle Bin | Verified',
      description: 'View and restore recently deleted items',
};

export default function RecycleBinPage() {
      return (
            <main>
                  <RecycleBinView />
            </main>
      );
}
