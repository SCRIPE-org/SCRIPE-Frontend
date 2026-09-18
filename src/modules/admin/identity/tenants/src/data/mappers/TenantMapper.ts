/**
 * Tenant Mapper
 *
 * Maps between Tenant Model (API DTO) and Tenant Entity (Domain).
 *
 * @module tenants/data
 */

import {
  Tenant,
  TenantTreeNode,
  SYSTEM_TENANT_ID,
  type TenantProps,
  type TenantTreeNodeProps,
} from "../../domain/entities/Tenant";
import {
  TenantModel,
  TenantTreeNodeModel,
  CreateTenantModel,
  UpdateTenantModel,
} from "../models/TenantModel";
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
} from "../../domain/entities/TenantRequests";
import { z } from "zod";
import {
  safeParseApiResponse,
  optionalString,
  isoDateString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Tenant Response Schema ────────────────────────────────────────────────────

const TenantModelSchema = z.object({
  id: z.string().optional().nullable(), // nullable: system tenant
  name: z.string().min(1),
  code: optionalString(),
  level: z.number().int().optional().default(0),
  path: optionalString(),
  isActive: z.boolean(),
  createdAt: isoDateString().optional(),
  parentId: optionalString(),
  parentName: optionalString(),
  description: optionalString(),
  settings: z.record(z.string(), z.unknown()).optional().nullable(),
  modifiedAt: optionalIsoDate(),
  editionName: optionalString(),
  editionEndDate: optionalIsoDate(),
  primaryDomain: optionalString(),
  domainCount: z.number().int().optional().default(0),
  adminEmail: optionalString(),
  countryCode: optionalString(),
  timeZone: optionalString(),
  children: z.array(z.unknown()).optional(),
});

const TenantTreeNodeModelSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1),
  code: z.string().optional().nullable(),
  level: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  isSuspended: z.boolean().optional().default(false),
  // suspensionType and subscriptionStatus: backend sends number, entity stores as string
  suspensionType: z.union([z.number(), z.string()]).optional().nullable(),
  suspensionReason: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  editionName: z.string().optional().nullable(),
  editionEndDate: z.string().optional().nullable(),
  subscriptionStatus: z.union([z.number(), z.string()]).optional().nullable(),
  children: z.array(z.unknown()).optional().default([]),
});

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class TenantMapper {
  /**
   * Map Model (DTO) to Domain Entity
   */
  static toEntity(model: TenantModel): Tenant {
    // Validate API response shape — logs warnings on contract drift
    const validated = safeParseApiResponse(TenantModelSchema, model, "Tenant");
    const props: TenantProps = {
      id: (validated.id as string | null | undefined) ?? SYSTEM_TENANT_ID,
      name: validated.name,
      code: validated.code ?? "",
      level: validated.level,
      path: validated.path ?? "",
      isActive: validated.isActive,
      createdAt: validated.createdAt ?? "",
      parentId: validated.parentId ?? undefined,
      parentName: validated.parentName ?? undefined,
      description: validated.description ?? undefined,
      settings: validated.settings as Record<string, unknown> | undefined,
      modifiedAt: validated.modifiedAt ?? undefined,
      editionName: validated.editionName ?? undefined,
      editionEndDate: validated.editionEndDate ?? undefined,
      primaryDomain: validated.primaryDomain ?? undefined,
      domainCount: validated.domainCount,
      adminEmail: validated.adminEmail ?? undefined,
      countryCode: validated.countryCode ?? model.countryCode ?? undefined,
      timeZone: validated.timeZone ?? model.timeZone ?? undefined,
      children: model.children?.map((c) => TenantMapper.toEntity(c as TenantModel).toProps()),
    };
    return new Tenant(props);
  }

  /**
   * Map TenantTreeNodeModel to TenantTreeNode
   */
  static toTreeNode(model: TenantTreeNodeModel): TenantTreeNode {
    const validated = safeParseApiResponse(TenantTreeNodeModelSchema, model, "TenantTreeNode");
    const props: TenantTreeNodeProps = {
      id: (validated.id as string | null | undefined) ?? SYSTEM_TENANT_ID,
      name: validated.name,
      code: validated.code ?? "",
      level: validated.level,
      isActive: validated.isActive,
      isSuspended: validated.isSuspended,
      // suspensionType may come as number from backend — entity stores as string
      suspensionType:
        validated.suspensionType != null ? String(validated.suspensionType) : undefined,
      suspensionReason: validated.suspensionReason ?? undefined,
      description: validated.description ?? undefined,
      parentId: validated.parentId ?? undefined,
      editionName: validated.editionName ?? undefined,
      editionEndDate: validated.editionEndDate ?? undefined,
      subscriptionStatus:
        validated.subscriptionStatus != null ? String(validated.subscriptionStatus) : undefined,
      children: (model.children ?? []).map((c) =>
        TenantMapper.toTreeNode(c as TenantTreeNodeModel)
      ),
    };
    return props as TenantTreeNode;
  }

  /**
   * Map array of Models to Entities
   */
  static toEntityList(models: TenantModel[]): Tenant[] {
    return models.map((model) => TenantMapper.toEntity(model));
  }

  /**
   * Map array of TreeNodeModels to TreeNodes
   */
  static toTreeNodeList(models: TenantTreeNodeModel[]): TenantTreeNode[] {
    return models.map((model) => TenantMapper.toTreeNode(model));
  }

  /**
   * Map CreateTenantRequest to CreateTenantModel
   */
  static toCreateModel(request: CreateTenantRequest): CreateTenantModel {
    return new CreateTenantModel(
      request.name,
      request.code,
      request.adminEmail,
      request.parentId,
      request.description,
      request.address,
      request.adminUsername,
      request.editionId,
      request.subscriptionType,
      request.currency,
      request.promotionId,
      request.promoCode,
      request.skipPayment,
      request.countryCode,
      request.timeZone
    );
  }

  /**
   * Map UpdateTenantRequest to UpdateTenantModel
   */
  static toUpdateModel(request: UpdateTenantRequest): UpdateTenantModel {
    return new UpdateTenantModel(
      request.name,
      request.description,
      request.isActive,
      request.address
    );
  }
}
