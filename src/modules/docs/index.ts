/**
 * Docs Module — Public API
 */

// Domain
export type { DocPageData } from './src/domain/entities/DocPage';
export { DocPage } from './src/domain/entities/DocPage';
export type { DocCategoryData, DocNavItem } from './src/domain/entities/DocCategory';
export { DocCategory } from './src/domain/entities/DocCategory';
export type { DocSection } from './src/domain/entities/DocSection';
export type { IDocsRepository, SearchResult } from './src/domain/interfaces/IDocsRepository';

// Data
export { registerPage, registerPages } from './src/data/repositories/DocsRepository';

// Presentation
export { DocsI18nProvider, useDocsI18n } from './src/presentation/providers/DocsI18nProvider';
export type { DocLanguage, DocDirection } from './src/presentation/providers/DocsI18nProvider';
export { DocsPageView } from './src/presentation/views/DocsPageView';

// DI
export { docsContainer } from './di';
