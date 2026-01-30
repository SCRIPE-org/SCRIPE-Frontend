import { SettingsView } from "@/components/app_views/settings-view";
import { DashboardLayout } from "@core/ui/layout/dashboard-layout";

export default async function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsView />
    </DashboardLayout>
  );
}
