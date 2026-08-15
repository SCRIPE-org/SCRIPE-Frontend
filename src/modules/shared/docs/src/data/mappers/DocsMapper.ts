import { DocPage } from "../../domain/entities/DocPage";
import type { DocPageData } from "../../domain/entities/DocPage";
import { DocCategory } from "../../domain/entities/DocCategory";
import type { DocCategoryData } from "../../domain/entities/DocCategory";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class DocsMapper {
  static toPageEntity(dto: DocPageData): DocPage {
    return new DocPage({
      slug: dto.slug ?? "",
      titleKey: dto.titleKey ?? "",
      descriptionKey: dto.descriptionKey ?? "",
      category: dto.category ?? "",
      order: dto.order ?? 0,
      sections: dto.sections ?? [],
      relatedSlugs: dto.relatedSlugs ?? [],
      lastUpdated: dto.lastUpdated ?? "",
    });
  }

  static toCategoryEntity(dto: DocCategoryData): DocCategory {
    return new DocCategory({
      id: dto.id ?? "",
      titleKey: dto.titleKey ?? "",
      icon: dto.icon ?? "",
      order: dto.order ?? 0,
      items: dto.items ?? [],
    });
  }
}
