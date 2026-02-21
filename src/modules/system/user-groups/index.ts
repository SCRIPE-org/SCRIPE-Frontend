/**
 * User Groups Module
 *
 * System module for managing user groups — batch role assignment
 * and field-level restrictions for groups of admins.
 *
 * @module user-groups
 */
export { UserGroup } from "./src/domain/entities/UserGroup";
export type { IUserGroupRepository } from "./src/domain/interfaces/IUserGroupRepository";
export { UserGroupRepository } from "./src/data/repositories/UserGroupRepository";
export { UserGroupService } from "./src/data/services/UserGroupService";
