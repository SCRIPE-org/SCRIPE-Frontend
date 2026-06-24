/**
 * @file index.ts
 * @description Main entry point for the Identity Module. Exports submodules, DI container,
 * and registers cross-module services (like tenantRepository) at runtime to avoid static imports.
 */

import { registerComponent } from "@core/common/component-registry";
import { identityContainer } from "./di";

// Register tenantRepository at runtime to decouple cross-module static dependencies
registerComponent("tenantRepository", identityContainer.tenantRepository);

// Re-export submodules
export * from "./admin";
export * from "./roles";
export * from "./permissions";
export * from "./tenants";

// Re-export DI container
export { identityContainer };
