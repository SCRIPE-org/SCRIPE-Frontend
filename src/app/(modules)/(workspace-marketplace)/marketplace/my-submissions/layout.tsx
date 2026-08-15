import { Metadata } from "next";

// Metadata must be exported from a Server Component — this segment's page.tsx
// is a client component (it needs live t() translation for its PageHeader),
// so the export lives here instead, one level up.
export const metadata: Metadata = {
  title: "My Submissions | Marketplace",
  description: "Manage your app submissions and reviews.",
};

export default function VendorSubmissionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
