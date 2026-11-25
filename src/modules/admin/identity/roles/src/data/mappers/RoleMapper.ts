/**
 * Role Mapper
 *
 * Maps between Role Model (API DTO) and Role Entity (Domain).
 *
 * @module roles/data
 */

import { Role, type RoleProps, type RolePermission } from "../../domain/entities/Role";
import * as RoleModel from "../models/RoleModel";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
} from "../../domain/entities/RoleRequests";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  isoDateString,
} from "@core/common/zod-utils";

// ─── Role Response Schema ────────────────────────────────────────────────────

const RolePermissionModelSchema = z.object({
  permissionId: uuidField(),
  permissionCode: z.string().min(1),
  scope: z.string().optional().nullable(),
  restrictedFields: z.array(z.string()).nullish(),
});

const RoleModelSchema = z.object({
  id: uuidField(),
  nameEn: z.string().min(1),
  nameAr: z.string().optional().default(""),
  code: z.string().optional().nullable(),
  isSystem: z.boolean().optional().default(false),
  isTenantSuperAdmin: z.boolean().nullish().default(false),
  isPermissionLocked: z.boolean().nullish().default(false),
  priority: z.number().int().optional().default(0),
  isActive: z.boolean(),
  permissions: z.array(RolePermissionModelSchema).optional().default([]),
  createdAt: isoDateString().optional(),
  descriptionEn: optionalString(),
  descriptionAr: optionalString(),
  tenantId: optionalString(),
  tenantName: optionalString(),
  modifiedAt: isoDateString().optional().nullable(),
  groupNamesEn: z.array(z.string()).optional(),
  groupNamesAr: z.array(z.string()).optional(),
  defaultLandingTarget: optionalString(),
  isLandingEnforced: z.boolean().optional().default(false),
  rowVersion: optionalString(),
});

/** Normalizes structured role landing policy before sending to Role create/update endpoints. */
export function normalizeRoleLandingPolicy(
  rawTarget?: string | null,
  rawEnforced?: boolean
): { defaultLandingTarget: string | null; isLandingEnforced: boolean } {
  const trimmed = typeof rawTarget === "string" ? rawTarget.trim().toLowerCase() : "";
  const defaultLandingTarget = !trimmed || trimmed === "default" ? null : trimmed;
  const canEnforce = defaultLandingTarget !== null && defaultLandingTarget !== "hub";
  return {
    defaultLandingTarget,
    isLandingEnforced: canEnforce ? Boolean(rawEnforced) : false,
  };
}

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class RoleMapper {
  /**
   * Map Model (DTO) to Domain Entity
   */
  static toEntity(model: RoleModel.RoleModel): Role {
    // Validate API response shape — logs warnings on contract drift
    const validated = safeParseApiResponse(RoleModelSchema, model, "Role");
    const permissions: RolePermission[] = (validated.permissions ?? []).map((p) => ({
      permissionId: p.permissionId,
      permissionCode: p.permissionCode,
      scope: p.scope ?? undefined,
      restrictedFields: p.restrictedFields ?? undefined,
    }));

    const props: RoleProps = {
      id: validated.id,
      nameEn: validated.nameEn,
      nameAr: validated.nameAr ?? "",
      code: validated.code ?? "",
      isSystem: validated.isSystem,
      isTenantSuperAdmin: Boolean(validated.isTenantSuperAdmin),
      isPermissionLocked: Boolean(validated.isPermissionLocked),
      priority: validated.priority,
      isActive: validated.isActive,
      permissions,
      createdAt: validated.createdAt ?? "",
      descriptionEn: validated.descriptionEn ?? undefined,
      descriptionAr: validated.descriptionAr ?? undefined,
      tenantId: validated.tenantId ?? undefined,
      tenantName: validated.tenantName ?? undefined,
      modifiedAt: validated.modifiedAt ?? undefined,
      groupNamesEn: validated.groupNamesEn,
      groupNamesAr: validated.groupNamesAr,
      defaultLandingTarget: validated.defaultLandingTarget ?? null,
      isLandingEnforced: Boolean(validated.isLandingEnforced),
      rowVersion: validated.rowVersion ?? null,
    };

    return new Role(props);
  }

  /**
   * Map Domain Entity to Model (DTO)
   */
  static toModel(entity: Role): RoleModel.RoleModel {
    const permissions = entity.permissions.map(
      (p) =>
        new RoleModel.RolePermissionModel(
          p.permissionId,
          p.permissionCode,
          p.scope,
          p.restrictedFields
        )
    );

    return new RoleModel.RoleModel(
      entity.id,
      entity.nameEn,
      entity.nameAr,
      entity.code,
      entity.isSystem,
      entity.priority,
      entity.isActive,
      permissions,
      entity.createdAt,
      entity.descriptionEn,
      entity.descriptionAr,
      entity.tenantId,
      entity.tenantName,
      entity.modifiedAt,
      entity.toProps().groupNamesEn,
      entity.toProps().groupNamesAr,
      entity.defaultLandingTarget,
      entity.isLandingEnforced,
      entity.rowVersion,
      entity.isTenantSuperAdmin,
      entity.isPermissionLocked
    );
  }

  /**
   * Map array of Models to Entities
   */
  static toEntityList(models: RoleModel.RoleModel[]): Role[] {
    return models.map((model) => RoleMapper.toEntity(model));
  }

  /**
   * Map CreateRoleRequest to CreateRoleModel
   */
  static toCreateModel(request: CreateRoleRequest): RoleModel.CreateRoleModel {
    const hasLandingField =
      request.defaultLandingTarget !== undefined || request.isLandingEnforced !== undefined;
    const normalizedLanding = hasLandingField
      ? normalizeRoleLandingPolicy(request.defaultLandingTarget, request.isLandingEnforced)
      : undefined;

    return new RoleModel.CreateRoleModel(
      request.nameEn,
      request.nameAr,
      request.code,
      request.priority ?? 100,
      request.descriptionEn,
      request.descriptionAr,
      request.tenantId,
      request.permissionIds?.length ? request.permissionIds : undefined,
      normalizedLanding?.defaultLandingTarget,
      normalizedLanding?.isLandingEnforced
    );
  }

  /**
   * Map UpdateRoleRequest to UpdateRoleModel
   */
  static toUpdateModel(request: UpdateRoleRequest): RoleModel.UpdateRoleModel {
    const hasLandingField =
      request.defaultLandingTarget !== undefined || request.isLandingEnforced !== undefined;
    const normalizedLanding = hasLandingField
      ? normalizeRoleLandingPolicy(request.defaultLandingTarget, request.isLandingEnforced)
      : undefined;

    return new RoleModel.UpdateRoleModel(
      request.nameEn,
      request.nameAr,
      request.priority,
      request.descriptionEn,
      request.descriptionAr,
      request.isActive,
      normalizedLanding?.defaultLandingTarget,
      normalizedLanding?.isLandingEnforced,
      request.rowVersion
    );
  }

  /**
   * Map AssignPermissionsRequest to AssignPermissionsModel
   */
  static toAssignPermissionsModel(
    request: AssignPermissionsRequest
  ): RoleModel.AssignPermissionsModel {
    return new RoleModel.AssignPermissionsModel(request.permissions);
  }
}
