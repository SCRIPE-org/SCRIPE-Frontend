import type { SavedTemplate } from "../entities/SavedTemplate";

/**
 * Http API network service for i template storage.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ITemplateStorageService {
  load(): SavedTemplate[];
  save(templates: SavedTemplate[]): void;
}
