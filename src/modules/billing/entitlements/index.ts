/**
 * @file index.ts
 * @description Main entry point for the Entitlements module.
 * Registers cross-module services (like downloadReceipt) at runtime to avoid static imports.
 */

import { registerComponent } from "@core/common/component-registry";
import { entitlementsContainer } from "./di";

// Register downloadReceipt helper at runtime to decouple cross-module static dependencies
registerComponent("downloadReceipt", (tenantId: string) =>
  entitlementsContainer.subscriptionRepository.downloadReceipt(tenantId)
);
