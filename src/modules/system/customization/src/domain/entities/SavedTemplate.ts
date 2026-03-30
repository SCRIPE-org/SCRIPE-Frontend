/**
 * SavedTemplate — User-saved builder canvas templates
 *
 * Stored in localStorage via STORAGE_KEYS.BUILDER_TEMPLATES.
 * Domain entity — no API/presentation concerns.
 *
 * @module customization/domain
 */
import type { CanvasComponent, CanvasBackground } from "./CanvasComponent";

export interface SavedTemplate {
  id: string;
  name: string;
  components: CanvasComponent[];
  gridRows: number;
  background: CanvasBackground;
  createdAt: string;
}
