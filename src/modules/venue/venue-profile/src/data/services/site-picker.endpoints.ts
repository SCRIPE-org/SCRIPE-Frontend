import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * OrganizationCore's Sites list — read-only cross-module lookup used solely
 * by SitePickerService to power the Site picker on Venue Profile creation.
 * See ISitePickerService for why this stays a thin lookup, not a repository.
 */
export const SITE_PICKER_ENDPOINTS = {
  LIST: `${V1}/sites`,
} as const;
