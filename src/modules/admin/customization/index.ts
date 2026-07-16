/**
 * @file index.ts
 * @description Main entry point for the Customization module.
 * Registers cross-module services (like customizationService) at runtime to avoid static imports.
 */

import { registerComponent } from "@core/common/component-registry";
import { customizationContainer } from "./di";

// Register customizationService at runtime to decouple cross-module static dependencies
registerComponent("customizationService", customizationContainer.customizationService);
