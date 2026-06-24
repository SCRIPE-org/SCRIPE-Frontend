/**
 * TemplateStorageService — Manages saved builder templates in localStorage.
 *
 * Lives in the data layer (not presentation) per frontend-architecture.md rules.
 * Uses centralized STORAGE_KEYS from @core/config/storage-keys.ts.
 */
import { STORAGE_KEYS } from "@core/config/storage-keys";
import type { SavedTemplate } from "../../domain/entities/SavedTemplate";
import type { IApiService } from "@core/interfaces/api.interface";

/**
 * API service for executing HTTP calls related to TemplateStorage endpoints.
 */
export class TemplateStorageService {
  constructor(private readonly api?: IApiService) {}
  static load(): SavedTemplate[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BUILDER_TEMPLATES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static save(templates: SavedTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.BUILDER_TEMPLATES, JSON.stringify(templates));
  }

  static add(template: SavedTemplate): SavedTemplate[] {
    const existing = TemplateStorageService.load();
    const updated = [...existing, template];
    TemplateStorageService.save(updated);
    return updated;
  }

  static remove(id: string): SavedTemplate[] {
    const existing = TemplateStorageService.load();
    const updated = existing.filter((t) => t.id !== id);
    TemplateStorageService.save(updated);
    return updated;
  }
}
