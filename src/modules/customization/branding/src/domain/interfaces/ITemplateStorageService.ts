import type { SavedTemplate } from "../entities/SavedTemplate";

/**
 * Interface defining operations for the TemplateStorage network service.
 */
export interface ITemplateStorageService {
  load(): SavedTemplate[];
  save(templates: SavedTemplate[]): void;
}
