import { DashboardLayout } from "@/core/ui/layout/dashboard-layout";
import { SettingsView } from "@core/settings/presentation/views/SettingsView";

export default function SettingsPage() {
      return (
            <DashboardLayout>
                  <SettingsView />
            </DashboardLayout>
      );
}