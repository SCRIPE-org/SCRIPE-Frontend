import type { SavedTemplate } from "../entities/SavedTemplate";

export interface ITemplateStorageService {
  load(): SavedTemplate[];
  save(templates: SavedTemplate[]): void;
}
