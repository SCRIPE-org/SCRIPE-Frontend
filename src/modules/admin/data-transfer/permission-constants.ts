/**
 * Data Transfer Module Permissions
 *
 * Covers: Entities Catalog, Import/Export Jobs, Mapping Presets, and Migrations.
 * Aligns with backend DataTransferPermissionProvider definitions.
 */
export const DATA_TRANSFER_PERMISSIONS = {
  // ── Jobs & Entities ──────────────────────────────────────
  JOBS_VIEW: "datatransfer.jobs.view",
  JOBS_MANAGE: "datatransfer.jobs.manage",

  // ── Presets ──────────────────────────────────────────────
  PRESETS_VIEW: "datatransfer.presets.view",
  PRESETS_MANAGE: "datatransfer.presets.manage",

  // ── Migrations ───────────────────────────────────────────
  MIGRATIONS_EXECUTE: "datatransfer.migrations.execute",
} as const;

/** Type representing valid Data Transfer permission codes. */
export type DataTransferPermissionCode =
  (typeof DATA_TRANSFER_PERMISSIONS)[keyof typeof DATA_TRANSFER_PERMISSIONS];
