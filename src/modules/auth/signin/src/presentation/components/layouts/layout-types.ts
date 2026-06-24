import type { ReactNode } from "react";
import type { TenantBranding } from "@modules/auth/core/domain/entities/TenantBranding";
import type { SlotConfig } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

/**
 * Interface structure detailing the properties and attributes of Login Layout Props.
 */
export interface LoginLayoutProps {
  branding: TenantBranding | null;
  slotConfig: SlotConfig;
  formContent: ReactNode;
  topActions: ReactNode;
  footer: ReactNode;
  footerSlot: ReactNode;
  logoSrc: string;
  logoAlt: string;
  companyName: string;
  direction: string;
  loginStep: string;
  t: (key: string) => string;
}

/** Common CSS background style applied to most layouts */
export const BG_STYLE = "selection:bg-primary/20";

/** Full-page wrapper background (uses CSS vars for image + solid fallback) */
export const WRAPPER_STYLE = {
  background:
    "var(--login-bg-image, none) center/cover no-repeat, var(--login-bg, hsl(var(--background)))",
  lineHeight: "var(--login-line-height, 1.5)",
  letterSpacing: "var(--login-letter-spacing, 0px)",
} as const;

/** Split layouts use transparent bg on the outer wrapper */
export const SPLIT_WRAPPER_STYLE = {
  ...WRAPPER_STYLE,
  background: "none",
} as const;

/** Form side in split layouts gets bg-image + solid fallback */
export const FORM_SIDE_BG_STYLE = {
  background:
    "var(--login-bg-image, none) var(--login-bg-image-position, center)/var(--login-bg-image-fit, cover) no-repeat, var(--login-bg, hsl(var(--background)))",
} as const;

/** Standard card style shared across card-based layouts */
export function cardStyle(maxWidth = "440px") {
  return {
    maxWidth: `var(--login-form-width, ${maxWidth})`,
    borderRadius: "var(--login-radius-card, 16px)",
    padding: "var(--login-card-padding, 32px)",
    boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
    backgroundColor: "var(--login-surface, hsl(var(--background)))",
  } as const;
}
