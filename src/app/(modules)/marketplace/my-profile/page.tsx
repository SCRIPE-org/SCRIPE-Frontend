import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Vendor Profile | SCRIPE Marketplace",
  description: "Manage your developer profile and organization details.",
};

export default function VendorProfilePage() {
  return (
    <main className="p-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Vendor Profile</h1>
        <p className="text-muted-foreground">
          Manage your organization details, API keys, and vendor identity. This feature is coming
          soon.
        </p>
      </div>
    </main>
  );
}
