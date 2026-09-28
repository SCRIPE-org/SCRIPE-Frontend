/**
 * Tenant Domains Workspace Page
 *
 * Dedicated route (`/domains`) for tenant and workspace administrators to manage
 * vanity custom domains, DNS verification challenges, routing targets, and SSL/TLS status.
 *
 * Protected under the `tenants.view` system permission mapping.
 *
 * @module app/(workspace-admin)/domains
 */

import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantDomainsView = dynamic(() =>
  import("@modules/identity/tenants").then((m) => ({ default: m.TenantDomainsView }))
);

export const metadata: Metadata = {
  title: "Custom Domains",
  description: "Configure custom domains, DNS records, and SSL certificates for your workspace",
};

/**
 * Server component page entry point rendering the TenantDomainsView within an error boundary.
 */
export default function DomainsPage() {
  return (
    <ModuleErrorBoundary moduleName="tenant.domainsTitle">
      <TenantDomainsView />
    </ModuleErrorBoundary>
  );
}
