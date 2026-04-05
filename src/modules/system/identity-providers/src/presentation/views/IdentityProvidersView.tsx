/**
 * Identity Providers List View
 *
 * Main page for identity provider management (SSO configuration).
 * Uses GenericCrudView for standard CRUD + custom protocol/scope columns.
 */
"use client";

import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import { useIdentityProvidersViewModel } from "../viewmodels/useIdentityProvidersViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function IdentityProvidersView() {
  useModuleLocales(() => import("../../../locales"), "identity-providers");

      const { vm, config } = useIdentityProvidersViewModel();

      return <GenericCrudView viewModel={vm} config={config} />;
}
