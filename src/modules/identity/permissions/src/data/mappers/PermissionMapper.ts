/**
 * Permission Mapper
 *
 * Maps between Permission Model (API DTO) and Permission Entity (Domain).
 *
 * @module permissions/data
 */

import { Permission, type PermissionProps } from "../../domain/entities/Permission";
import {
  PermissionModel,
  CreatePermissionModel,
  UpdatePermissionModel,
} from "../models/PermissionModel";
import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "../../domain/entities/PermissionRequests";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const PermissionModelSchema = z.object({
  id: uuidField(),
  resource: z.string().min(1),
  action: z.string().min(1),
  permissionCode: z.string().min(1),
  defaultScope: optionalString(),
  category: optionalString(),
  displayOrder: z.number().int().optional().default(0),
  descriptionEn: optionalString(),
  descriptionAr: optionalString(),
  nameEn: optionalString(),
  nameAr: optionalString(),
});

export class PermissionMapper {
  /**
   * Map Model (DTO) to Domain Entity
   */
  static toEntity(model: PermissionModel): Permission {
    const validated = safeParseApiResponse(PermissionModelSchema, model, "Permission");

    const props: PermissionProps = {
      id: validated.id,
      resource: validated.resource,
      action: validated.action,
      code: validated.permissionCode,
      defaultScope: validated.defaultScope ?? "",
      category: validated.category ?? "",
      displayOrder: validated.displayOrder ?? 0,
      descriptionEn: validated.descriptionEn ?? undefined,
      descriptionAr: validated.descriptionAr ?? undefined,
      nameEn: validated.nameEn ?? undefined,
      nameAr: validated.nameAr ?? undefined,
    };
    return new Permission(props);
  }

  /**
   * Map Domain Entity to Model (DTO)
   */
  static toModel(entity: Permission): PermissionModel {
    return new PermissionModel(
      entity.id,
      entity.resource,
      entity.action,
      entity.code,
      entity.defaultScope,
      entity.category,
      entity.displayOrder,
      entity.descriptionEn,
      entity.descriptionAr,
      entity.nameEn,
      entity.nameAr
    );
  }

  /**
   * Map array of Models to Entities
   */
  static toEntityList(models: PermissionModel[]): Permission[] {
    return models.map((model) => PermissionMapper.toEntity(model));
  }

  /**
   * Map CreatePermissionRequest to CreatePermissionModel
   */
  static toCreateModel(request: CreatePermissionRequest): CreatePermissionModel {
    // Generate permissionCode from resource.action
    const permissionCode = `${request.resource}.${request.action}`;
    return new CreatePermissionModel(
      request.resource,
      request.action,
      permissionCode,
      request.category || "system",
      request.displayOrder ?? 0,
      request.descriptionEn,
      request.descriptionAr,
      undefined, // nameEn not in request
      undefined // nameAr not in request
    );
  }

  /**
   * Map UpdatePermissionRequest to UpdatePermissionModel
   */
  static toUpdateModel(request: UpdatePermissionRequest): UpdatePermissionModel {
    return new UpdatePermissionModel(
      request.descriptionEn,
      request.descriptionAr,
      undefined, // nameEn not in request
      undefined, // nameAr not in request
      request.category,
      request.displayOrder
    );
  }
}
