/**
 * Court Photos Domain Utilities
 *
 * Provides safe extraction, packing, and validation for court photos.
 * Photo URLs are persisted in the court description metadata envelope
 * (`<!-- court-photos: [...] -->`), ensuring 100% database persistence
 * across all database engines without requiring schema mutations.
 */

export const DEFAULT_COURT_PHOTOS: readonly string[] = [
  "/images/venue/padel-court-indoor.svg",
  "/images/venue/padel-court-outdoor.svg",
  "/images/venue/football-turf-night.svg",
];

const PHOTOS_COMMENT_REGEX = /<!--\s*court-photos:\s*(\[[\s\S]*?\])\s*-->/;

/**
 * Extracts uploaded court photo URLs from the description metadata envelope.
 */
export function extractCourtPhotos(description?: string | null): string[] {
  if (!description) return [];
  const match = description.match(PHOTOS_COMMENT_REGEX);
  if (!match || !match[1]) return [];
  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Malformed JSON envelope, safely return empty
  }
  return [];
}

/**
 * Extracts clean user-facing bio text by stripping the hidden metadata comment.
 */
export function extractCourtBio(description?: string | null): string {
  if (!description) return "";
  return description.replace(PHOTOS_COMMENT_REGEX, "").trim();
}

/**
 * Combines clean bio text and photos into a persisted description string.
 */
export function packCourtDescription(bio: string, photos: string[]): string {
  const cleanBio = bio.replace(PHOTOS_COMMENT_REGEX, "").trim();
  const validPhotos = photos.filter((p) => typeof p === "string" && p.trim().length > 0);

  if (validPhotos.length === 0) {
    return cleanBio;
  }

  const envelope = `<!-- court-photos: ${JSON.stringify(validPhotos)} -->`;
  return cleanBio.length > 0 ? `${cleanBio}\n\n${envelope}` : envelope;
}

/**
 * Returns a display-ready array of photos: uploaded photos first, followed
 * by canonical defaults to ensure the 3-thumbnail gallery is always complete.
 */
export function getDisplayCourtPhotos(description?: string | null): string[] {
  const custom = extractCourtPhotos(description);
  const remainingDefaults = DEFAULT_COURT_PHOTOS.filter((d) => !custom.includes(d));
  return [...custom, ...remainingDefaults];
}
