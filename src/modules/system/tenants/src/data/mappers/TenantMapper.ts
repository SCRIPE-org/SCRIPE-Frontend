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

export class TenantMapper {
  /**
   * Map Model (DTO) to Domain Entity
   */
  static toEntity(model: TenantModel): Tenant {
    const props: TenantProps = {
      id: model.id ?? SYSTEM_TENANT_ID,
      name: model.name,
      code: model.code,
      level: model.level,
      path: model.path,
      isActive: model.isActive,
      createdAt: model.createdAt,
      parentId: model.parentId,
      parentName: model.parentName,
      description: model.description,
      settings: model.settings,
      modifiedAt: model.modifiedAt,
      children: model.children?.map((c) => TenantMapper.toEntity(c).toProps()),
    };
    return new Tenant(props);
  }

  /**
   * Map TenantTreeNodeModel to TenantTreeNode
   */
  static toTreeNode(model: TenantTreeNodeModel): TenantTreeNode {
    const props: TenantTreeNodeProps = {
      id: model.id ?? SYSTEM_TENANT_ID,
      name: model.name,
      code: model.code,
      level: model.level,
      isActive: model.isActive,
      description: model.description,
      parentId: model.parentId,
      children: model.children.map((c) => TenantMapper.toTreeNode(c)),
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
      request.parentId,
      request.description,
      request.address,
      request.editionId
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
