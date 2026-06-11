/**
 * Permission Repository Implementation
 *
 * Implements IPermissionRepository using PermissionService.
 * Uses PermissionMapper to convert Models → Entities.
 *
 * Clean Architecture:
 * View → ViewModel → Repository → Service → IApiService
 *                        ↓
 *                    Mapper (Model ↔ Entity)
 *
 * @module permissions/data
 */
import type {
  IPermissionRepository,
  PermissionListParams,
} from "../../domain/interfaces/IPermissionRepository";
import { Permission } from "../../domain/entities/Permission";
import type { PermissionModuleGroup } from "../../domain/entities/Permission";
import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "../../domain/entities/PermissionRequests";
import type { IPermissionService } from "../../domain/interfaces/IPermissionService";
import { PermissionMapper } from "../mappers/PermissionMapper";

export class PermissionRepository implements IPermissionRepository {
  constructor(private readonly service: IPermissionService) {}

  async getAll(params?: PermissionListParams): Promise<Permission[]> {
    const models = await this.service.getAll(params);
    return PermissionMapper.toEntityList(models);
  }

  async getMyPermissions(params?: PermissionListParams): Promise<Permission[]> {
    const models = await this.service.getMyPermissions(params);
    return PermissionMapper.toEntityList(models);
  }

  async getForTenant(tenantId: string, params?: PermissionListParams): Promise<Permission[]> {
    const models = await this.service.getForTenant(tenantId, params);
    return PermissionMapper.toEntityList(models);
  }

  async getById(id: string): Promise<Permission> {
    const model = await this.service.getById(id);
    return PermissionMapper.toEntity(model);
  }

  async getCategories(): Promise<string[]> {
    return this.service.getCategories();
  }

  async getGrouped(search?: string): Promise<PermissionModuleGroup[]> {
    const json = await this.service.getGrouped(search);
    return PermissionMapper.toEntityGrouped(json);
  }

  async getGroupedForTenant(tenantId: string, search?: string): Promise<PermissionModuleGroup[]> {
    const json = await this.service.getGroupedForTenant(tenantId, search);
    return PermissionMapper.toEntityGrouped(json);
  }

  async create(request: CreatePermissionRequest): Promise<string> {
    const model = PermissionMapper.toCreateModel(request);
    const response = await this.service.create(model.toJson());
    return response.id;
  }

  async update(id: string, request: UpdatePermissionRequest): Promise<void> {
    const model = PermissionMapper.toUpdateModel(request);
    await this.service.update(id, model.toJson());
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
