/**
 * Docs Module — DI Container
 */

import { DocsRepository } from "./src/data/repositories/DocsRepository";

export const docsContainer = {
  docsRepository: new DocsRepository(),
};
