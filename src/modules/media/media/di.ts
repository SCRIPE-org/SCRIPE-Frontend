/**
 * Media Module DI Container
 *
 * Provides dependency injection mapping for the Media module.
 *
 * Backend API: Media
 */
import { getModuleApiService } from "@core/services/api-factory";

export interface MediaContainer {}

let _container: MediaContainer | null = null;

/**
 * Get the media container (lazy initialization)
 */
export function getMediaContainer(): MediaContainer {
  if (typeof window === "undefined") {
    return {};
  }

  if (!_container) {
    const apiService = getModuleApiService("MEDIA");
    _container = {};
  }

  return _container;
}

/**
 * Media container accessor (for use in components)
 */
export const mediaContainer = {};
