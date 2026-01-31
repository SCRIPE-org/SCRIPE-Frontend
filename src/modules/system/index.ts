/**
 * System Module
 *
 * Parent module for all system administration features.
 * Contains submodules: admin, roles, permissions, tenants, menus
 */

// Re-export submodules
export * from "./admin";
export * from "./roles";
export * from "./permissions";
export * from "./tenants";
export * from "./menus";

// Re-export DI container
export { systemContainer } from "./di";
