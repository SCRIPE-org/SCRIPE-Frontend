/**
 * Court Photos Domain Utilities
 *
 * Provides safe first-class extraction, serialization, and fallback
 * for court photos. Photo URLs and gallery items are stored directly
 * in the first-class `photoMetadata` / `imageUrl` fields on the resource,
 * with seamless backward-compatible fallback to legacy description comments.
 */

export const DEFAULT_COURT_PHOTOS: readonly string[] = [
  "/images/venue/padel-court-indoor.svg",
  "/images/venue/padel-court-outdoor.svg",
  "/images/venue/football-turf-night.svg",
];

const PHOTOS_COMMENT_REGEX = /<!--\s*court-photos:\s*(\[[\s\S]*?\])\s*-->/;

/**
 * Extracts uploaded court photo URLs from first-class photoMetadata,
 * falling back to the legacy description comment if needed.
 */
export function extractCourtPhotos(photoMetadata?: string | null, description?: string | null): string[] {
  // If first parameter looks like a legacy description with comment and second parameter is omitted
  if (photoMetadata && !description && photoMetadata.includes("<!-- court-photos:")) {
    description = photoMetadata;
    photoMetadata = undefined;
  }

  // 1. Try first-class photoMetadata
  if (photoMetadata && photoMetadata.trim().length > 0) {
    try {
      const parsed = JSON.parse(photoMetadata);
      if (Array.isArray(parsed)) {
        const urls = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        if (urls.length > 0) return urls;
      }
    } catch {
      // Malformed JSON, fallback below
    }
  }

  // 2. Backward-compatible fallback to description comment
  if (description) {
    const match = description.match(PHOTOS_COMMENT_REGEX);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        }
      } catch {
        // Malformed JSON envelope
      }
    }
  }

  return [];
}

/**
 * Extracts clean user-facing bio text by stripping any legacy metadata comment.
 */
export function extractCourtBio(description?: string | null): string {
  if (!description) return "";
  return description.replace(PHOTOS_COMMENT_REGEX, "").trim();
}

/**
 * Serializes photo array into first-class photoMetadata JSON string.
 */
export function packCourtPhotoMetadata(photos: string[]): string {
  const validPhotos = photos.filter((p) => typeof p === "string" && p.trim().length > 0);
  return JSON.stringify(validPhotos);
}

/**
 * Combines clean bio text without any comments (kept for backward compatibility).
 */
export function packCourtDescription(bio: string, photos?: string[]): string {
  const cleanBio = extractCourtBio(bio);
  if (!photos || photos.length === 0) {
    return cleanBio;
  }
  // Deprecated legacy mode if caller explicitly passes photos
  return cleanBio;
}

/**
 * Returns a display-ready array of photos: uploaded photos first, followed
 * by canonical defaults to ensure the 3-thumbnail gallery is always complete.
 */
export function getDisplayCourtPhotos(photoMetadata?: string | null, description?: string | null): string[] {
  const custom = extractCourtPhotos(photoMetadata, description);
  const remainingDefaults = DEFAULT_COURT_PHOTOS.filter((d) => !custom.includes(d));
  return [...custom, ...remainingDefaults];
}
