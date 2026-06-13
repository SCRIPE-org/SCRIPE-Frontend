import { EditionCategory } from "../../domain/entities/EditionCategory";
import type { EditionCategoryModel } from "../models/EditionCategoryModels";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../../domain/entities/EditionCategoryRequests";

export class EditionCategoryMapper {
  static toEntity(model: EditionCategoryModel): EditionCategory {
    return new EditionCategory({
      id: model.id,
      name: model.name,
      displayNameEn: model.displayNameEn,
      displayNameAr: model.displayNameAr,
      description: model.description,
      sortOrder: model.sortOrder ?? 0,
      createdAt: model.createdAt,
    });
  }

  static toCreateJson(req: CreateEditionCategoryRequest): CreateEditionCategoryRequest {
    return {
      name: req.name.trim(),
      displayNameEn: req.displayNameEn?.trim() || undefined,
      displayNameAr: req.displayNameAr?.trim() || undefined,
      description: req.description?.trim() || undefined,
      sortOrder: req.sortOrder ?? 0,
    };
  }

  static toUpdateJson(req: UpdateEditionCategoryRequest): UpdateEditionCategoryRequest {
    return {
      name: req.name?.trim(),
      displayNameEn: req.displayNameEn?.trim() || undefined,
      displayNameAr: req.displayNameAr?.trim() || undefined,
      description: req.description?.trim() || undefined,
      sortOrder: req.sortOrder,
    };
  }
}
