import type React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
      title: 'Documentation | Verified Platform',
      description: 'Comprehensive documentation for the Verified ERP Platform - Backend (.NET 10) & Frontend (Next.js)',
      keywords: ['verified', 'documentation', 'erp', 'cqrs', '.net', 'next.js', 'modular monolith'],
};

export default function DocsRootLayout({
      children,
}: {
      children: React.ReactNode;
}) {
      return <>{children}</>;
}
