/**
 * UserGroup Mapper
 *
 * Converts between UserGroupModel (DTO) and UserGroup (domain entity).
 *
 * @module user-groups/data
 */
import { UserGroup, type UserGroupProps } from "../../domain/entities/UserGroup";
import { UserGroupModel } from "../models/UserGroupModel";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  isoDateString,
} from "@core/common/zod-utils";

// ─── UserGroup Response Schema ─────────────────────────────────────────────────

const UserGroupModelSchema = z.object({
  id: uuidField(),
  nameEn: z.string().min(1),
  nameAr: z.string().optional().default(""),
  code: z.string().optional().default(""),
  descriptionEn: optionalString(),
  descriptionAr: optionalString(),
  tenantId: z.string().optional().default(""),
  tenantName: optionalString(),
  isActive: z.boolean().optional().default(true),
  memberCount: z.number().int().optional().default(0),
  roleCount: z.number().int().optional().default(0),
  createdAt: isoDateString().optional(),
  modifiedAt: isoDateString().optional().nullable(),
  members: z.array(z.unknown()).optional(),
  roles: z.array(z.unknown()).optional(),
  restrictions: z.array(z.unknown()).optional(),
});

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class UserGroupMapper {
  static toEntity(model: UserGroupModel): UserGroup {
    // Validate API response shape — logs warnings on contract drift
    const validated = safeParseApiResponse(UserGroupModelSchema, model, "UserGroup");
    const props: UserGroupProps = {
      id: validated.id,
      nameEn: validated.nameEn,
      nameAr: validated.nameAr ?? "",
      code: validated.code ?? "",
      descriptionEn: validated.descriptionEn ?? undefined,
      descriptionAr: validated.descriptionAr ?? undefined,
      tenantId: validated.tenantId ?? "",
      tenantName: validated.tenantName ?? undefined,
      isActive: validated.isActive,
      memberCount: validated.memberCount,
      roleCount: validated.roleCount,
      createdAt: validated.createdAt ?? "",
      modifiedAt: validated.modifiedAt ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      members: validated.members as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roles: validated.roles as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      restrictions: validated.restrictions as any,
    };
    return new UserGroup(props);
  }

  static toEntityList(models: UserGroupModel[]): UserGroup[] {
    return models.map((m) => this.toEntity(m));
  }
}
