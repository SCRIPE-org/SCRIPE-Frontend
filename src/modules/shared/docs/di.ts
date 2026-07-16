/**
 * Docs Module — DI Container
 *
 * IMPORTANT: registry.ts MUST be imported BEFORE DocsRepository is instantiated.
 * This ensures all registerPage() calls from every content file have executed,
 * populating the pageRegistry Map inside DocsRepository.ts before any page lookup.
 */

// ─── Content Registry (Side-effect import) ──────────────────────
// This triggers all registerPage() calls across all 70+ content files.
// Without this import, every getPage(slug) call returns undefined → 404.
import "./src/data/content/registry";

import { DocsRepository } from "./src/data/repositories/DocsRepository";

export const docsContainer = {
  docsRepository: new DocsRepository(),
};
