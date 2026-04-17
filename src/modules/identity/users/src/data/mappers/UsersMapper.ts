/**
 * Users Mapper
 *
 * Converts raw DTOs from the API to domain entities.
 * Null-coalesces all nullable fields to safe defaults.
 */

import { UsersEntity } from "../../domain/entities/UsersEntity";
import type { UsersListModel, UsersDetailModel } from "../models/UsersModel";

export class UsersMapper {
  /** Map list-level DTO → domain entity (subset of fields) */
  static toEntity(dto: UsersListModel): UsersEntity {
    return new UsersEntity({
      id: dto.id ?? "",
      username: dto.username ?? "",
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      middleName: "",
      email: dto.email ?? "",
      isEmailVerified: false,
      phoneNumber: "",
      isPhoneVerified: false,
      birthDate: "",
      gender: null,
      imageUrl: "",
      country: "",
      government: "",
      city: "",
      isActive: dto.isActive ?? false,
      lastLoginAt: "",
      createdAt: "",
    });
  }

  /** Map detail-level DTO → domain entity (all fields) */
  static toDetailEntity(dto: UsersDetailModel): UsersEntity {
    return new UsersEntity({
      id: dto.id ?? "",
      username: dto.username ?? "",
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      middleName: dto.middleName ?? "",
      email: dto.email ?? "",
      isEmailVerified: dto.isEmailVerified ?? false,
      phoneNumber: dto.phoneNumber ?? "",
      isPhoneVerified: dto.isPhoneVerified ?? false,
      birthDate: dto.birthDate ?? "",
      gender: dto.gender ?? null,
      imageUrl: dto.imageUrl ?? "",
      country: dto.country ?? "",
      government: dto.government ?? "",
      city: dto.city ?? "",
      isActive: dto.isActive ?? false,
      lastLoginAt: dto.lastLoginAt ?? "",
      createdAt: dto.createdAt ?? "",
    });
  }
}
