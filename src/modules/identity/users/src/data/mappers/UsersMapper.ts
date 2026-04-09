import { UsersEntity } from "../../domain/entities/UsersEntity";
import type { UsersModel } from "../models/UsersModel";

export class UsersMapper {
  static toEntity(dto: UsersModel): UsersEntity {
    return new UsersEntity({
      id: dto.id ?? "",
      email: dto.email ?? "",
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      isActive: dto.isActive ?? "",
      isLocked: dto.isLocked ?? "",
      tenantName: dto.tenantName ?? "",
      lastLoginAt: dto.lastLoginAt ?? "",
      createdAt: dto.createdAt ?? "",
    });
  }
}
