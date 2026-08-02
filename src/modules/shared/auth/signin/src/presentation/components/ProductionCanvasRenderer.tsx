/**
 * ProductionCanvasRenderer — Renders builder canvas layouts on the REAL login page.
 *
 * This is the production counterpart to CanvasRenderer in the customization module.
 * Key difference: `loginForm` type renders the REAL auth form instead of a mock.
 *
 * All design tokens are inherited from CSS variables set by useLoginBrandingTokens.
 * Individual component types are handled by ProductionComponent.
 *
 * @module auth/signin/components
 */
"use client";

import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { ProductionComponent } from "./ProductionComponent";

// ── Minimal type defs (avoid importing from customization module) ─────────
interface CanvasComponentData {
  id: string;
  type: string;
  gridColumn: string;
  gridRow: string;
  alignment: string;
  verticalAlignment: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
  zIndex: number;
  visible: boolean;
}

interface CanvasBackgroundData {
  type: string;
  value: string;
}

interface ProductionCanvasRendererProps {
  components: CanvasComponentData[];
  gridRows: number;
  canvasBackground?: CanvasBackgroundData;
  /** Position mode: 'grid' = CSS Grid, 'absolute' = free-form x/y */
  positionMode?: "grid" | "absolute";
  /** The REAL form content (CredentialsForm + SSO + SlotRenderers) */
  formContent: React.ReactNode;
  logoUrl: string;
  companyName: string;
  direction: string;
  headline?: string;
  subtitle?: string;
  copyrightText?: string;
}

const GRID_COLUMNS = 12;

const alignMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

const commonStyle: React.CSSProperties = {
  fontFamily: "var(--login-font-body, inherit)",
  lineHeight: "var(--login-line-height, 1.5)",
  letterSpacing: "var(--login-letter-spacing, 0px)",
};

function TopActionsBar() {
  return (
    <div
      style={{
        position: "fixed",
        left: 32,
        right: 32,
        top: 32,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
      }}
    >
      <div className="flex gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </div>
  );
}

/**
 * Presentation UI component rendering the production canvas renderer.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ProductionCanvasRenderer({
  components,
  gridRows,
  canvasBackground,
  positionMode = "grid",
  formContent,
  logoUrl,
  companyName,
  direction,
  headline,
  subtitle,
  copyrightText,
}: ProductionCanvasRendererProps) {
  let bg = "var(--login-bg, hsl(var(--background)))";
  if (canvasBackground && canvasBackground.type !== "inherit" && canvasBackground.value) {
    bg = canvasBackground.value;
  }

  const visibleComponents = components.filter((c) => c.visible).sort((a, b) => a.zIndex - b.zIndex);

  const renderComponent = (comp: CanvasComponentData) => (
    <ProductionComponent
      type={comp.type}
      props={comp.props}
      formContent={formContent}
      logoUrl={logoUrl}
      companyName={companyName}
      headline={headline}
      subtitle={subtitle}
      copyrightText={copyrightText}
    />
  );

  if (positionMode === "absolute") {
    return (
      <div
        className="login-page min-h-screen w-full selection:bg-primary/20"
        dir={direction}
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          background: bg,
          overflow: "hidden",
          ...commonStyle,
        }}
      >
        <TopActionsBar />
        {visibleComponents.map((comp) => (
          <div
            key={comp.id}
            style={{
              position: "absolute",
              insetInlineStart: `${comp.x || 0}px`,
              top: `${comp.y || 0}px`,
              width: comp.width ? `${comp.width}px` : "auto",
              height: comp.height ? `${comp.height}px` : "auto",
              zIndex: comp.zIndex,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderComponent(comp)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="login-page min-h-screen w-full selection:bg-primary/20"
      dir={direction}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, minmax(60px, auto))`,
        minHeight: "100vh",
        gap: "0px",
        background: bg,
        ...commonStyle,
      }}
    >
      <TopActionsBar />
      {visibleComponents.map((comp) => (
        <div
          key={comp.id}
          style={{
            gridColumn: comp.gridColumn,
            gridRow: comp.gridRow,
            display: "flex",
            alignItems: alignMap[comp.verticalAlignment] || "center",
            justifyContent: alignMap[comp.alignment] || "center",
            padding: "8px",
            zIndex: comp.zIndex,
          }}
        >
          {renderComponent(comp)}
        </div>
      ))}
    </div>
  );
}
