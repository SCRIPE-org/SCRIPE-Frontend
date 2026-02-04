/**
 * My Tenant Settings Page
 *
 * Allows tenant admins to configure their organization's settings.
 * Permission required: tenant_settings.view
 */
import { TenantSettingsView } from "@modules/system/tenant-settings";

export default function TenantSettingsPage() {
      return <TenantSettingsView />;
}
