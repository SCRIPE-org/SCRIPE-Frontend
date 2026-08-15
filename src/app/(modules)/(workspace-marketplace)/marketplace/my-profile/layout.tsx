import { Metadata } from "next";

// Metadata must be exported from a Server Component — this segment's page.tsx
// is a client component (it needs live t() translation for its PageHeader),
// so the export lives here instead, one level up.
export const metadata: Metadata = {
  title: "My Profile | Marketplace",
  description: "Manage your developer profile and organization details.",
};

export default function VendorProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
