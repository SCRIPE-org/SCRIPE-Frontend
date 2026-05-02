"use client";

import type { ReactNode } from "react";
import type { TenantBranding } from "@modules/auth/core/domain/entities/TenantBranding";
import type { LoginLayout, SlotConfig } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { ProductionCanvasRenderer } from "./ProductionCanvasRenderer";
import { SplitRightLayout, LAYOUT_REGISTRY } from "./layouts";

// ── Canvas type guards (for builder mode) ──────────────────────────────────
interface CanvasComponentData {
  id: string; type: string; gridColumn: string; gridRow: string;
  alignment: string; verticalAlignment: string; x: number; y: number;
  width: number; height: number; props: Record<string, unknown>;
  zIndex: number; visible: boolean;
}
interface CanvasBackgroundData { type: string; value: string; }

function isCanvasComponent(v: unknown): v is CanvasComponentData {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  return typeof c.id === "string" && typeof c.type === "string";
}
function isCanvasComponents(v: unknown): v is CanvasComponentData[] {
  return Array.isArray(v) && v.every(isCanvasComponent);
}
function toCanvasBackground(v: unknown): CanvasBackgroundData | undefined {
  if (!v || typeof v !== "object") return undefined;
  const b = v as Record<string, unknown>;
  if (typeof b.type !== "string" || typeof b.value !== "string") return undefined;
  return { type: b.type, value: b.value };
}

// ── Props ──────────────────────────────────────────────────────────────────
export interface LoginLayoutRouterProps {
  layout: LoginLayout;
  slotConfig: SlotConfig;
  loginBrandingJson: string | null;
  branding: TenantBranding | null;
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

/**
 * LoginLayoutRouter — thin router dispatching to one of 22 layout components.
 *
 * Two modes:
 *  1. Builder mode  — renders full canvas (drag-and-drop builder output)
 *  2. Template mode — looks up layout in LAYOUT_REGISTRY and renders it
 */
export function LoginLayoutRouter({
  layout, slotConfig, loginBrandingJson, branding,
  formContent, topActions, footer, footerSlot,
  logoSrc, logoAlt, companyName, direction, loginStep, t,
}: LoginLayoutRouterProps) {
  // ── Builder mode: full canvas from studio ──────────────────────────────
  const parsedBranding = (() => {
    if (!loginBrandingJson) return null;
    try { return JSON.parse(loginBrandingJson) as Record<string, unknown>; }
    catch { return null; }
  })();

  if (parsedBranding?.canvasMode === "builder" && isCanvasComponents(parsedBranding.components)) {
    return (
      <ProductionCanvasRenderer
        components={parsedBranding.components}
        gridRows={typeof parsedBranding.canvasGridRows === "number" ? parsedBranding.canvasGridRows : 8}
        canvasBackground={toCanvasBackground(parsedBranding.canvasBackground)}
        positionMode={parsedBranding.canvasPositionMode === "absolute" ? "absolute" : "grid"}
        formContent={formContent}
        logoUrl={logoSrc}
        companyName={companyName}
        direction={direction}
        headline={branding?.loginHeadline || t("auth.branding.headline")}
        subtitle={branding?.loginSubtitle || t("auth.branding.subtitle")}
        copyrightText={typeof parsedBranding.copyrightText === "string" ? parsedBranding.copyrightText : ""}
      />
    );
  }

  // ── Template mode: dispatch to layout component ─────────────────────────
  const LayoutComponent = LAYOUT_REGISTRY[layout] ?? SplitRightLayout;
  const layoutProps = {
    branding, slotConfig, formContent, topActions, footer, footerSlot,
    logoSrc, logoAlt, companyName, direction, loginStep, t,
  };

  return <LayoutComponent {...layoutProps} />;
}
