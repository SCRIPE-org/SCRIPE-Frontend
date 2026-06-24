/**
 * Users Mapper
 *
 * Converts raw DTOs from the API to domain entities.
 * Null-coalesces all nullable fields to safe defaults.
 */

import { UsersEntity } from "../../domain/entities/UsersEntity";
import type { UsersListModel, UsersDetailModel } from "../models/UsersModel";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const UsersListModelSchema = z.object({
  id: uuidField(),
  username: optionalString(),
  firstName: optionalString(),
  lastName: optionalString(),
  email: optionalString(),
  isActive: z.boolean().optional().default(false),
});

const UsersDetailModelSchema = z.object({
  id: uuidField(),
  username: optionalString(),
  firstName: optionalString(),
  lastName: optionalString(),
  middleName: optionalString(),
  email: optionalString(),
  isEmailVerified: z.boolean().optional().default(false),
  phoneNumber: optionalString(),
  isPhoneVerified: z.boolean().optional().default(false),
  birthDate: optionalString(),
  gender: z.number().int().optional().nullable(),
  imageUrl: optionalString(),
  country: optionalString(),
  government: optionalString(),
  city: optionalString(),
  isActive: z.boolean().optional().default(false),
  lastLoginAt: optionalString(),
  createdAt: optionalString(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class UsersMapper {
  /** Map list-level DTO → domain entity (subset of fields) */
  static toEntity(dto: UsersListModel): UsersEntity {
    const validated = safeParseApiResponse(UsersListModelSchema, dto, "UsersListItem");

    return new UsersEntity({
      id: validated.id,
      username: validated.username ?? "",
      firstName: validated.firstName ?? "",
      lastName: validated.lastName ?? "",
      middleName: "",
      email: validated.email ?? "",
      isEmailVerified: false,
      phoneNumber: "",
      isPhoneVerified: false,
      birthDate: "",
      gender: null,
      imageUrl: "",
      country: "",
      government: "",
      city: "",
      isActive: validated.isActive ?? false,
      lastLoginAt: "",
      createdAt: "",
    });
  }

  /** Map detail-level DTO → domain entity (all fields) */
  static toDetailEntity(dto: UsersDetailModel): UsersEntity {
    const validated = safeParseApiResponse(UsersDetailModelSchema, dto, "UsersDetail");

    return new UsersEntity({
      id: validated.id,
      username: validated.username ?? "",
      firstName: validated.firstName ?? "",
      lastName: validated.lastName ?? "",
      middleName: validated.middleName ?? "",
      email: validated.email ?? "",
      isEmailVerified: validated.isEmailVerified ?? false,
      phoneNumber: validated.phoneNumber ?? "",
      isPhoneVerified: validated.isPhoneVerified ?? false,
      birthDate: validated.birthDate ?? "",
      gender: validated.gender ?? null,
      imageUrl: validated.imageUrl ?? "",
      country: validated.country ?? "",
      government: validated.government ?? "",
      city: validated.city ?? "",
      isActive: validated.isActive ?? false,
      lastLoginAt: validated.lastLoginAt ?? "",
      createdAt: validated.createdAt ?? "",
    });
  }
}
