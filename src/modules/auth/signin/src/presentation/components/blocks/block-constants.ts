import type { CSSProperties } from "react";

/**
 * Constant definition representing a n i m a t i o n_ s t y l e s.
 */
export const ANIMATION_STYLES: Record<string, CSSProperties> = {
  none: {},
  "fade-in": { animation: "fadeIn 0.6s ease-out both" },
  "slide-up": { animation: "slideUp 0.5s ease-out both" },
  "slide-left": { animation: "slideLeft 0.5s ease-out both" },
  "slide-right": { animation: "slideRight 0.5s ease-out both" },
  "scale-in": { animation: "scaleIn 0.4s ease-out both" },
  bounce: { animation: "bounceIn 0.6s ease-out both" },
};

/**
 * Constant definition representing p a d d i n g_ p x.
 */
export const PADDING_PX: Record<string, string> = { none: "0", sm: "6px", md: "12px", lg: "20px" };
/**
 * Constant definition representing m a r g i n_ p x.
 */
export const MARGIN_PX: Record<string, string> = { none: "0", sm: "8px", md: "16px", lg: "28px" };

/**
 * Constant definition representing f o n t_ s i z e_ m a p.
 */
export const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

/**
 * Constant definition representing f o n t_ w e i g h t_ m a p.
 */
export const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

/**
 * Constant definition representing s h a d o w_ m a p.
 */
export const SHADOW_MAP: Record<string, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

/**
 * Constant definition representing a l i g n_ m a p.
 */
export const ALIGN_MAP: Record<string, string> = {
  left: "text-start",
  center: "text-center",
  right: "text-end",
};

/**
 * Constant definition representing h o v e r_ m a p.
 */
export const HOVER_MAP: Record<string, string> = {
  none: "",
  zoom: "hover:scale-105 transition-transform duration-300",
  brightness: "hover:brightness-110 transition-all duration-300",
  grayscale: "grayscale hover:grayscale-0 transition-all duration-500",
};

/**
 * Constant definition representing a s p e c t_ m a p.
 */
export const ASPECT_MAP: Record<string, string> = {
  auto: "",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
};

/**
 * Constant definition representing s o c i a l_ i c o n s.
 */
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
