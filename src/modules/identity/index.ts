/**
 * Identity Module
 *
 * Core IAM module for identity & access management.
 * Contains submodules: admin, roles, permissions, tenants, user-groups
 */

// Re-export submodules
export * from "./admin";
export * from "./roles";
export * from "./permissions";
export * from "./tenants";

// Re-export DI container
export { identityContainer } from "./di";
