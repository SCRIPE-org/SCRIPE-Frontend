/**
 * @file module-bridges.ts
 * @description Cross-module service bridges.
 *
 * WHY THIS EXISTS
 * ---------------
 * Modules must not statically import each other (FE-018). The original escape hatch was a
 * runtime component registry (`@core/common/component-registry`): a module barrel called
 * `registerComponent(...)` at import time, and a consumer in another module called
 * `getComponent(...)` to retrieve it.
 *
 * That contract was never actually satisfied. Registration is a *side effect of importing the
 * barrel*, and the routes that consume these services never import the barrels — every route
 * deep-imports the one view it renders. `@modules/identity`, `@modules/customization` and
 * `@modules/entitlements` were imported by nothing at all, so their keys were never registered.
 * The result was a set of features that looked implemented and silently did nothing:
 *
 *   - subscriptions never fetched the tenant admin email (`enabled: !!tenantRepository` was false)
 *   - the receipt download threw "Download receipt service not available"
 *   - the dashboard theme studio could not persist
 *
 * These bridges replace the lookup with a real, statically-resolvable dependency, while keeping
 * the module boundary intact: the dependency direction is core -> module (allowed), never
 * module -> module (forbidden). This mirrors the existing `@core/hooks/use-auth-bridge`.
 *
 * Each accessor uses a dynamic `import()` so the consuming route does NOT pull the whole target
 * module into its initial bundle — the module is fetched on first use, inside the async call that
 * needs it. That preserves the code-splitting the registry was reaching for, without the silent
 * failure mode.
 */

import type { ITenantRepository } from "@modules/identity/tenants/src/domain/interfaces/ITenantRepository";

/**
 * Resolves the identity module's tenant repository.
 *
 * Call it inside an async boundary (a react-query `queryFn`, an event handler, a mutation),
 * never during render.
 */
export async function getTenantRepository(): Promise<ITenantRepository> {
  const { identityContainer } = await import("@modules/identity/di");
  return identityContainer.tenantRepository;
}

/**
 * Downloads a subscription billing receipt through the entitlements module.
 *
 * @param tenantId The tenant whose receipt is being downloaded.
 * @returns The receipt blob and its server-provided filename.
 */
export async function downloadSubscriptionReceipt(
  tenantId: string
): Promise<{ blob: Blob; filename: string }> {
  const { entitlementsContainer } = await import("@modules/entitlements/di");
  return entitlementsContainer.subscriptionRepository.downloadReceipt(tenantId);
}

/**
 * Persists the tenant display preferences JSON through the customization module.
 *
 * @param preferencesJson The serialized display-preferences payload.
 */
export async function saveTenantDisplayPrefs(preferencesJson: string): Promise<void> {
  const { customizationContainer } = await import("@modules/customization/di");
  await customizationContainer.customizationService.saveTenantDisplayPrefs(preferencesJson);
}
