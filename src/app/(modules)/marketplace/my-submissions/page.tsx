import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Submissions | NEXORA Marketplace",
  description: "Manage your app submissions and reviews.",
};

export default function VendorSubmissionsPage() {
  return (
    <main className="p-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">My Submissions</h1>
        <p className="text-muted-foreground">
          Track your app submission statuses, upload new versions, and view reviewer feedback. This feature is coming soon.
        </p>
      </div>
    </main>
  );
}
