/**
 * TemplateStorageService — Manages tenant-scoped saved builder templates in `localStorage`.
 *
 * Lives in the data layer (not presentation) per frontend-architecture.md rules.
 * Partitioned by active tenant scope (`scr_tenant_ctx.id` -> `user.tenantId` -> `tenantCode` -> `"platform"`)
 * so saved templates from Tenant A never bleed into Tenant B on shared browsers (`LS-03`).
 */
import { resolveTenantScopedStorageKey } from "@core/common/session-cleanup-registry";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import type { IApiService } from "@core/interfaces/api.interface";
import type { SavedTemplate } from "../../domain/entities/SavedTemplate";

/**
 * Resolves the tenant-scoped `localStorage` key for customization builder templates.
 */
export function resolveBuilderTemplateStorageKey(explicitTenantScope?: string | null): string {
  return resolveTenantScopedStorageKey(STORAGE_KEYS.BUILDER_TEMPLATES, explicitTenantScope);
}

/**
 * Data-layer service managing tenant-isolated builder templates in browser storage.
 */
export class TemplateStorageService {
  constructor(private readonly api?: IApiService) {}

  static load(explicitTenantScope?: string | null): SavedTemplate[] {
    if (typeof window === "undefined") return [];
    try {
      const scopedKey = resolveBuilderTemplateStorageKey(explicitTenantScope);
      const raw = window.localStorage.getItem(scopedKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
      // Migrate legacy unscoped key ONLY for platform context if present
      if (scopedKey === `${STORAGE_KEYS.BUILDER_TEMPLATES}:platform`) {
        const legacy = window.localStorage.getItem(STORAGE_KEYS.BUILDER_TEMPLATES);
        if (legacy) {
          const parsedLegacy = JSON.parse(legacy);
          if (Array.isArray(parsedLegacy)) {
            window.localStorage.setItem(scopedKey, JSON.stringify(parsedLegacy));
            window.localStorage.removeItem(STORAGE_KEYS.BUILDER_TEMPLATES);
            return parsedLegacy;
          }
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  static save(templates: SavedTemplate[], explicitTenantScope?: string | null): void {
    if (typeof window === "undefined") return;
    const scopedKey = resolveBuilderTemplateStorageKey(explicitTenantScope);
    window.localStorage.setItem(scopedKey, JSON.stringify(templates));
    window.localStorage.removeItem(STORAGE_KEYS.BUILDER_TEMPLATES);
  }

  static add(template: SavedTemplate, explicitTenantScope?: string | null): SavedTemplate[] {
    const existing = TemplateStorageService.load(explicitTenantScope);
    const updated = [...existing, template];
    TemplateStorageService.save(updated, explicitTenantScope);
    return updated;
  }

  static remove(id: string, explicitTenantScope?: string | null): SavedTemplate[] {
    const existing = TemplateStorageService.load(explicitTenantScope);
    const updated = existing.filter((t) => t.id !== id);
    TemplateStorageService.save(updated, explicitTenantScope);
    return updated;
  }
}
