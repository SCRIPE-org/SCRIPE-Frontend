import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Earnings | SCRIPE Marketplace",
  description: "View your sales, payouts, and financial reports.",
};

export default function VendorEarningsPage() {
  return (
    <main className="p-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">My Earnings</h1>
        <p className="text-muted-foreground">
          View your sales reports, pending payouts, and download tax documents. This feature is coming soon.
        </p>
      </div>
    </main>
  );
}
