/**
 * Admin Mapper
 *
 * Converts between AdminModel (DTO) and Admin (Entity).
 * Repository uses this to transform service responses.
 *
 * @module admin/data
 */
import { Admin, type AdminData, type AdminRoleData } from "../../domain/entities/Admin";
import {
  AdminModel,
  CreateAdminModel,
  UpdateAdminModel,
  type AdminJson,
  type AdminRoleJson,
} from "../models/AdminModel";
import type { CreateAdminRequest, UpdateAdminRequest } from "../../domain/entities/AdminRequests";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  isoDateString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Admin Response Schema ────────────────────────────────────────────────────

const AdminRoleJsonSchema = z.object({
  id: uuidField(),
  nameEn: z.string(),
  nameAr: z.string().optional().default(""),
});

const AdminModelSchema = z.object({
  id: uuidField(),
  username: z.string().min(1),
  isActive: z.boolean(),
  createdAt: isoDateString().optional(),
  firstName: optionalString(),
  lastName: optionalString(),
  phoneNumber: optionalString(),
  email: optionalString(),
  lastLoginAt: optionalIsoDate(),
  notes: optionalString(),
  roles: z.array(AdminRoleJsonSchema).optional(),
  roleNamesEn: z.array(z.string()).optional(),
  roleNamesAr: z.array(z.string()).optional(),
  groupNamesEn: z.array(z.string()).optional(),
  groupNamesAr: z.array(z.string()).optional(),
  tenantId: optionalString(),
  tenantName: optionalString(),
  isSuperAdmin: z.boolean().optional().default(false),
  canModify: z.boolean().optional().default(true),
  isAccountActivated: z.boolean().optional().default(false),
  mustChangePassword: z.boolean().optional().default(false),
  isProtected: z.boolean().optional().default(false),
});

export class AdminMapper {
  /**
   * Convert AdminModel to Admin Entity
   */
  static toEntity(model: AdminModel): Admin {
    // Validate API response shape before consuming — logs warnings on contract drift
    const validated = safeParseApiResponse(AdminModelSchema, model, "Admin");
    const data: AdminData = {
      id: validated.id,
      username: validated.username,
      isActive: validated.isActive,
      createdAt: validated.createdAt ?? "",
      firstName: validated.firstName ?? undefined,
      lastName: validated.lastName ?? undefined,
      phoneNumber: validated.phoneNumber ?? undefined,
      email: validated.email ?? undefined,
      lastLoginAt: validated.lastLoginAt ?? undefined,
      notes: validated.notes ?? undefined,
      roles: validated.roles
        ? AdminMapper.toRoleDataList(validated.roles as unknown as AdminRoleJson[])
        : undefined,
      roleNamesEn: validated.roleNamesEn,
      roleNamesAr: validated.roleNamesAr,
      tenantId: validated.tenantId ?? undefined,
      tenantName: validated.tenantName ?? undefined,
      isSuperAdmin: validated.isSuperAdmin,
      canModify: validated.canModify,
      groupNamesEn: validated.groupNamesEn,
      groupNamesAr: validated.groupNamesAr,
      isAccountActivated: validated.isAccountActivated,
      mustChangePassword: validated.mustChangePassword,
      isProtected: validated.isProtected,
    };
    return new Admin(data);
  }

  /**
   * Convert Admin Entity to AdminModel
   */
  static toModel(entity: Admin): AdminModel {
    return new AdminModel(
      entity.id,
      entity.username,
      entity.isActive,
      entity.createdAt,
      entity.firstName,
      entity.lastName,
      entity.phoneNumber,
      entity.email,
      entity.lastLoginAt,
      entity.notes,
      entity.roles,
      entity.data.roleNamesEn,
      entity.data.roleNamesAr,
      entity.tenantId,
      entity.tenantName,
      entity.isSuperAdmin,
      entity.canModify,
      undefined
    );
  }

  /**
   * Convert AdminJson (raw API) to Admin Entity
   * Shortcut for fromJson -> toEntity
   */
  static fromJsonToEntity(json: AdminJson): Admin {
    const model = AdminModel.fromJson(json);
    return AdminMapper.toEntity(model);
  }

  /**
   * Convert Admin Entity to AdminJson
   * Shortcut for toModel -> toJson
   */
  static toJsonFromEntity(entity: Admin): AdminJson {
    const model = AdminMapper.toModel(entity);
    return model.toJson();
  }

  /**
   * Map CreateAdminRequest (domain) to CreateAdminModel (data)
   */
  static toCreateModel(request: CreateAdminRequest): CreateAdminModel {
    return new CreateAdminModel(
      request.username,
      request.password,
      request.firstName,
      request.lastName,
      request.phoneNumber,
      request.email,
      request.notes,
      request.tenantId,
      request.roleIds,
      request.userGroupIds,
      request.sendSetupEmail,
      request.mustChangePassword
    );
  }

  /**
   * Map UpdateAdminRequest (domain) to UpdateAdminModel (data)
   */
  static toUpdateModel(request: UpdateAdminRequest): UpdateAdminModel {
    return new UpdateAdminModel(
      request.firstName,
      request.lastName,
      request.phoneNumber,
      request.email,
      request.notes,
      request.isActive
    );
  }

  /**
   * Convert AdminRoleJson list to AdminRoleData list
   */
  static toRoleDataList(roles: AdminRoleJson[]): AdminRoleData[] {
    return roles.map((r) => AdminMapper.toRoleData(r));
  }

  /**
   * Convert single AdminRoleJson to AdminRoleData
   */
  static toRoleData(role: AdminRoleJson): AdminRoleData {
    return {
      ...role,
    };
  }
}
