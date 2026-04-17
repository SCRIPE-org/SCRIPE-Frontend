/**
 * TenantPlan Mapper — Model ↔ Entity conversion
 */
import { TenantPlan } from "../../domain/entities/TenantPlan";
import type { TenantPlanData } from "../../domain/entities/TenantPlan";
import type { TenantPlanModel, TenantPlanListModel } from "../models/TenantPlanModels";
import type { CreateTenantPlanRequest, UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";

export class TenantPlanMapper {
  static toEntity(model: TenantPlanModel): TenantPlan {
    const data: TenantPlanData = {
      id: model.id,
      tenantId: model.tenantId,
      name: model.name ?? "",
      description: model.description,
      price: model.price ?? 0,
      currency: model.currency ?? "USD",
      billingCycle: model.billingCycle ?? "Monthly",
      isActive: model.isActive ?? true,
      isPublic: model.isPublic ?? true,
      trialDays: model.trialDays ?? 0,
      maxUsers: model.maxUsers ?? -1,
      sortOrder: model.sortOrder ?? 0,
      activeSubscriberCount: model.activeSubscriberCount ?? 0,
      features: model.features ?? [],
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
    return new TenantPlan(data);
  }

  static toEntityFromList(model: TenantPlanListModel, tenantId: string = ""): TenantPlan {
    const data: TenantPlanData = {
      id: model.id,
      tenantId,
      name: model.name ?? "",
      description: model.description,
      price: model.price ?? 0,
      currency: model.currency ?? "USD",
      billingCycle: model.billingCycle ?? "Monthly",
      isActive: model.isActive ?? true,
      isPublic: model.isPublic ?? true,
      trialDays: model.trialDays ?? 0,
      maxUsers: model.maxUsers ?? -1,
      sortOrder: model.sortOrder ?? 0,
      activeSubscriberCount: model.activeSubscriberCount ?? 0,
      createdAt: model.createdAt,
    };
    return new TenantPlan(data);
  }

  static toCreateJson(request: CreateTenantPlanRequest): Record<string, unknown> {
    return {
      name: request.name,
      description: request.description || null,
      price: request.price,
      currency: request.currency ?? "USD",
      billingCycle: request.billingCycle ?? "Monthly",
      isPublic: request.isPublic ?? true,
      trialDays: request.trialDays ?? 0,
      maxUsers: request.maxUsers ?? -1,
      sortOrder: request.sortOrder ?? 0,
      features: request.features ?? [],
    };
  }

  static toUpdateJson(request: UpdateTenantPlanRequest): Record<string, unknown> {
    return {
      name: request.name,
      description: request.description || null,
      price: request.price,
      currency: request.currency,
      billingCycle: request.billingCycle,
      isActive: request.isActive,
      isPublic: request.isPublic,
      trialDays: request.trialDays,
      maxUsers: request.maxUsers,
      sortOrder: request.sortOrder,
      features: request.features ?? [],
    };
  }
}
