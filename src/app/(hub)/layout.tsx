import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace Hub",
  description: "Select your workspace to continue",
};

/**
 * Hub Layout — completely standalone, no NexusLayout/DashboardLayout.
 * The Hub is a standalone fullscreen page shown to admins who need
 * to select a module workspace before accessing the main dashboard.
 */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
