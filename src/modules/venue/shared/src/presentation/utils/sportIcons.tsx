import {
  Dumbbell,
  Layers,
  Waves,
  CircleDot,
} from "lucide-react";

/**
 * Clean SVG and Lucide icons for sports venue resources.
 * No emojis in production UI; only restrained, professional iconography.
 */

export function PadelIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Padel racket head */}
      <circle cx="12" cy="9" r="6" />
      {/* Perforations */}
      <circle cx="10" cy="8" r="0.75" fill="currentColor" />
      <circle cx="14" cy="8" r="0.75" fill="currentColor" />
      <circle cx="12" cy="10.5" r="0.75" fill="currentColor" />
      {/* Throat and handle */}
      <path d="M12 15v6" />
      <path d="M10 21h4" />
    </svg>
  );
}

/**
 * Documentation for module export
 */
export function FootballIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l3.5 2.5v4L12 16l-3.5-2.5v-4z" />
      <path d="M12 7V3" />
      <path d="M15.5 9.5l3.5-1.5" />
      <path d="M15.5 13.5l3 2.5" />
      <path d="M12 16v5" />
      <path d="M8.5 13.5l-3 2.5" />
      <path d="M8.5 9.5L5 8" />
    </svg>
  );
}

/**
 * Documentation for module export
 */
export function TennisIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="6" />
      <line x1="9" y1="6" x2="15" y2="12" />
      <line x1="9" y1="12" x2="15" y2="6" />
      <path d="M12 15v6" />
      <path d="M10 21h4" />
    </svg>
  );
}

/**
 * Documentation for module export
 */
export function BasketballIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M5.5 5.5a10 10 0 0 0 0 13" />
      <path d="M18.5 5.5a10 10 0 0 1 0 13" />
    </svg>
  );
}

/**
 * Documentation for resolveSportIcon
 */
export function resolveSportIcon(
  identifier?: string | null,
  className = "size-4"
): React.ReactElement {
  if (!identifier) {
    return <Layers className={className} aria-hidden="true" />;
  }

  const normalized = identifier.toLowerCase();

  if (normalized.includes("padel")) {
    return <PadelIcon className={className} />;
  }

  if (
    normalized.includes("football") ||
    normalized.includes("soccer") ||
    normalized.includes("pitch")
  ) {
    return <FootballIcon className={className} />;
  }

  if (normalized.includes("tennis")) {
    return <TennisIcon className={className} />;
  }

  if (normalized.includes("basket")) {
    return <BasketballIcon className={className} />;
  }

  if (
    normalized.includes("swim") ||
    normalized.includes("pool") ||
    normalized.includes("aquatic")
  ) {
    return <Waves className={className} aria-hidden="true" />;
  }

  if (
    normalized.includes("gym") ||
    normalized.includes("fitness") ||
    normalized.includes("workout") ||
    normalized.includes("train")
  ) {
    return <Dumbbell className={className} aria-hidden="true" />;
  }

  if (normalized.includes("squash")) {
    return <PadelIcon className={className} />;
  }

  if (normalized.includes("court") || normalized.includes("field")) {
    return <CircleDot className={className} aria-hidden="true" />;
  }

  return <Layers className={className} aria-hidden="true" />;
}
