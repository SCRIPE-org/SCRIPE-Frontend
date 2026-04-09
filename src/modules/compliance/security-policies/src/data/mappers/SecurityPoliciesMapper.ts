import { SecurityPoliciesEntity } from "../../domain/entities/SecurityPoliciesEntity";
import type { SecurityPoliciesModel } from "../models/SecurityPoliciesModel";

export class SecurityPoliciesMapper {
  static toEntity(dto: SecurityPoliciesModel): SecurityPoliciesEntity {
    return new SecurityPoliciesEntity({
      id: dto.id ?? "",
      name: dto.name ?? "",
      type: dto.type ?? "",
      cidrRange: dto.cidrRange ?? "",
      action: dto.action ?? "",
      isActive: dto.isActive ?? "",
      expiresAt: dto.expiresAt ?? "",
      createdAt: dto.createdAt ?? "",
    });
  }
}
