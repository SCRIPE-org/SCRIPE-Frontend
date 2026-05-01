/**
 * RecommendationBadge — Colored pill badge for edition recommendation labels.
 *
 * Uses a deterministic OKLCH color derived from a hash of the label text,
 * ensuring the same label always gets the same vibrant color.
 */
"use client";

/** Derive a stable hue [0-360] from a string */
function labelToHue(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

interface RecommendationBadgeProps {
  label: string;
  size?: "sm" | "md";
}

export function RecommendationBadge({ label, size = "md" }: RecommendationBadgeProps) {
  const hue = labelToHue(label);
  const bg = `oklch(0.35 0.18 ${hue})`;
  const border = `oklch(0.55 0.22 ${hue})`;
  const text = `oklch(0.92 0.12 ${hue})`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ backgroundColor: bg, borderColor: border, color: text }}
    >
      <span aria-hidden className="text-[9px]">
        ★
      </span>
      {label}
    </span>
  );
}
