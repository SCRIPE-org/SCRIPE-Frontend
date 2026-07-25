import { Metadata } from "next";

// Metadata must be exported from a Server Component — this segment's page.tsx
// is a client component (it needs live t() translation for its PageHeader),
// so the export lives here instead, one level up.
export const metadata: Metadata = {
  title: "My Earnings | Marketplace",
  description: "View your sales, payouts, and financial reports.",
};

export default function VendorEarningsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
