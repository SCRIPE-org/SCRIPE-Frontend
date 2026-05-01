/**
 * UserGroup Mapper
 *
 * Converts between UserGroupModel (DTO) and UserGroup (domain entity).
 *
 * @module user-groups/data
 */
import { UserGroup, type UserGroupProps } from "../../domain/entities/UserGroup";
import { UserGroupModel } from "../models/UserGroupModel";

export class UserGroupMapper {
  static toEntity(model: UserGroupModel): UserGroup {
    const props: UserGroupProps = {
      id: model.id,
      nameEn: model.nameEn,
      nameAr: model.nameAr,
      code: model.code,
      descriptionEn: model.descriptionEn,
      descriptionAr: model.descriptionAr,
      tenantId: model.tenantId,
      tenantName: model.tenantName,
      isActive: model.isActive,
      memberCount: model.memberCount,
      roleCount: model.roleCount,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
      members: model.members,
      roles: model.roles,
      restrictions: model.restrictions,
    };
    return new UserGroup(props);
  }

  static toEntityList(models: UserGroupModel[]): UserGroup[] {
    return models.map((m) => this.toEntity(m));
  }
}
