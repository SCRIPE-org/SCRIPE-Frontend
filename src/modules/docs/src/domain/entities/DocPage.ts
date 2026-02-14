/**
 * DocPage — Represents a single documentation page.
 * Contains metadata + ordered sections of content.
 */

import type { DocSection } from './DocSection';

export interface DocPageData {
      /** URL slug, e.g. 'features/authentication' */
      slug: string;
      /** Localization key for the page title */
      titleKey: string;
      /** Localization key for the page description */
      descriptionKey?: string;
      /** Category this page belongs to (matches DocCategory.id) */
      category: string;
      /** Sort order within the category */
      order: number;
      /** Content sections rendered in order */
      sections: DocSection[];
      /** Slugs of related doc pages */
      relatedSlugs?: string[];
      /** Last updated date ISO string */
      lastUpdated?: string;
}

export class DocPage {
      constructor(public readonly data: DocPageData) { }

      get slug() { return this.data.slug; }
      get titleKey() { return this.data.titleKey; }
      get descriptionKey() { return this.data.descriptionKey; }
      get category() { return this.data.category; }
      get order() { return this.data.order; }
      get sections() { return this.data.sections; }
      get relatedSlugs() { return this.data.relatedSlugs ?? []; }
      get lastUpdated() { return this.data.lastUpdated; }

      /** Extract heading sections for Table of Contents */
      getHeadings() {
            return this.data.sections.filter(
                  (s): s is Extract<DocSection, { type: 'heading' }> => s.type === 'heading'
            );
      }
}
