/**
 * Custom Fields Security & Key Management Page
 *
 * Server component that renders the Cryptographic Key Management & Migration portal.
 * Gated by custom-fields.manage-keys permission.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { KeyManagementTab } from "@/modules/custom-fields/custom-fields/key-management";

export const metadata: Metadata = {
  title: "Encryption & Key Management | Custom Fields",
  description: "Manage tenant encryption keys, multi-version keyring, and field rewrap migrations",
};

export default function CustomFieldsSecurityPage() {
  return (
    <ModuleErrorBoundary moduleName="customFieldsSecurity.title">
      <KeyManagementTab />
    </ModuleErrorBoundary>
  );
}
