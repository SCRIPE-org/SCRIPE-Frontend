import type { CSSProperties } from "react";

export const ANIMATION_STYLES: Record<string, CSSProperties> = {
  none: {},
  "fade-in": { animation: "fadeIn 0.6s ease-out both" },
  "slide-up": { animation: "slideUp 0.5s ease-out both" },
  "slide-left": { animation: "slideLeft 0.5s ease-out both" },
  "slide-right": { animation: "slideRight 0.5s ease-out both" },
  "scale-in": { animation: "scaleIn 0.4s ease-out both" },
  bounce: { animation: "bounceIn 0.6s ease-out both" },
};

export const PADDING_PX: Record<string, string> = { none: "0", sm: "6px", md: "12px", lg: "20px" };
export const MARGIN_PX: Record<string, string> = { none: "0", sm: "8px", md: "16px", lg: "28px" };

export const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

export const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

export const SHADOW_MAP: Record<string, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

export const ALIGN_MAP: Record<string, string> = {
  left: "text-start",
  center: "text-center",
  right: "text-end",
};

export const HOVER_MAP: Record<string, string> = {
  none: "",
  zoom: "hover:scale-105 transition-transform duration-300",
  brightness: "hover:brightness-110 transition-all duration-300",
  grayscale: "grayscale hover:grayscale-0 transition-all duration-500",
};

export const ASPECT_MAP: Record<string, string> = {
  auto: "",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
};

export const SOCIAL_ICONS: Record<string, string> = {
  twitter: "X",
  x: "X",
  facebook: "f",
  instagram: "IG",
  linkedin: "in",
  github: "GH",
  youtube: "play",
  tiktok: "TT",
  discord: "DC",
  reddit: "RD",
  dribbble: "DB",
  behance: "Be",
  medium: "M",
  pinterest: "P",
  whatsapp: "WA",
};
