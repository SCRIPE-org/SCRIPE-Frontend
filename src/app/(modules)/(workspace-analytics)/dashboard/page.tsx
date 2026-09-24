import { redirect } from "next/navigation";

/**
 * Route Compatibility Redirect
 *
 * In SCRIPE Platform Administration IA, the legacy /dashboard route is retired
 * and replaced by the unified /overview route (Platform Command Center / Tenant Organization Control Center).
 * Any direct navigation to /dashboard is permanently redirected to /overview.
 */
export default function DashboardPage() {
  redirect("/overview");
}
