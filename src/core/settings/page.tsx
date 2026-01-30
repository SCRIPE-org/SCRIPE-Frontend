import { SettingsView } from "./presentation/views/SettingsView";
import { DashboardLayout } from "@core/ui/layout/dashboard-layout";

export default async function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsView />
    </DashboardLayout>
  );
}
