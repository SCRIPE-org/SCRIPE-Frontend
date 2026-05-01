"use client";

/**
 * Module-Aware API Service Factory
 *
 * Creates and caches ApiService instances per module.
 *
 * Resolution order for each module:
 *   1. NEXT_PUBLIC_{MODULE}_API_URL  (microservice mode — module-specific URL)
 *   2. NEXT_PUBLIC_API_URL           (monolith mode — shared fallback)
 *   3. "/api"                        (development default)
 *
 * IMPORTANT: Next.js only inlines NEXT_PUBLIC_* env vars when accessed as
 * static string literals (e.g., process.env.NEXT_PUBLIC_FOO). Dynamic access
 * via process.env[varName] returns undefined. That's why we use a static
 * ENV_MAP below — each module's env var must be listed as a literal string.
 *
 * When adding a new module, add its entry to ENV_MAP below.
 */

import { ApiService } from "./api.service";
import type { IApiService } from "../interfaces/api.interface";

/**
 * Static env var lookup map.
 *
 * Next.js requires static string literals for process.env.NEXT_PUBLIC_*
 * to be inlined at build time. Add new modules here as they are created.
 */
const ENV_MAP: Record<string, string | undefined> = {
      IDENTITY: process.env.NEXT_PUBLIC_IDENTITY_API_URL,
      // ── Add new modules below this line ──
      COMPLIANCE: process.env.NEXT_PUBLIC_COMPLIANCE_API_URL,
      ENTITLEMENTS: process.env.NEXT_PUBLIC_ENTITLEMENTS_API_URL,
      // PRODUCTS: process.env.NEXT_PUBLIC_PRODUCTS_API_URL,
      // INVENTORY: process.env.NEXT_PUBLIC_INVENTORY_API_URL,
};

/** Cache: moduleKey → ApiService instance */
const instanceCache = new Map<string, IApiService>();

/** The base fallback URL used when no module-specific env var is set */
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").trim();

/** Cache key for the default (non-module) instance */
const BASE_KEY = "__base__";

/**
 * Get an ApiService instance for a specific module.
 *
 * @param moduleKey - Module identifier in UPPER_SNAKE_CASE (e.g., "PRODUCTS").
 *                    Must match a key in ENV_MAP above.
 * @returns Cached IApiService scoped to the correct base URL.
 *
 * @example
 * // Monolith — all resolve to NEXT_PUBLIC_API_URL
 * getModuleApiService()            // base
 * getModuleApiService("PRODUCTS")  // same base (no NEXT_PUBLIC_PRODUCTS_API_URL set)
 *
 * @example
 * // Microservice — NEXT_PUBLIC_PRODUCTS_API_URL=http://localhost:5010/api
 * getModuleApiService("PRODUCTS")  // → http://localhost:5010/api
 */
export function getModuleApiService(moduleKey?: string): IApiService {
      if (!moduleKey) {
            if (!instanceCache.has(BASE_KEY)) {
                  instanceCache.set(BASE_KEY, new ApiService(BASE_URL));
            }
            return instanceCache.get(BASE_KEY)!;
      }

      if (!instanceCache.has(moduleKey)) {
            // Look up from the static ENV_MAP (Next.js requires static literals)
            const rawUrl = ENV_MAP[moduleKey];
            const moduleUrl = rawUrl?.trim() || BASE_URL;

            // If module URL equals base URL, reuse the base instance to save memory
            if (moduleUrl === BASE_URL) {
                  if (!instanceCache.has(BASE_KEY)) {
                        instanceCache.set(BASE_KEY, new ApiService(BASE_URL));
                  }
                  instanceCache.set(moduleKey, instanceCache.get(BASE_KEY)!);
            } else {
                  instanceCache.set(moduleKey, new ApiService(moduleUrl));
            }
      }

      return instanceCache.get(moduleKey)!;
}

/**
 * Get the base (non-module) ApiService instance.
 * Shorthand for getModuleApiService() with no arguments.
 */
export function getBaseApiService(): IApiService {
      return getModuleApiService();
}
