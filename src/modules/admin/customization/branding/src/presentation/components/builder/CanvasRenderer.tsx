/**
 * CanvasRenderer — Dual-mode renderer for builder preview
 *
 * Supports TWO rendering modes:
 *   - **Grid**: CSS Grid layout using gridColumn/gridRow (default)
 *   - **Absolute**: Free-form positioning using x/y/width/height
 *
 * Used ONLY inside the LoginPreviewShell (iframe) when canvasMode === 'builder'.
 * This is a pure renderer — no DnD, no editing, no Zustand.
 * It inherits all design tokens set by the studio for consistent styling.
 */
"use client";

import type {
  CanvasComponent,
  CanvasBackground,
  PositionMode,
} from "../../../domain/entities/CanvasComponent";
import { CANVAS_GRID_COLUMNS, CANVAS_WIDTH } from "../../../domain/entities/CanvasComponent";
import { ComponentRenderer } from "./ComponentRenderer";

interface CanvasRendererProps {
  components: CanvasComponent[];
  gridRows: number;
  canvasBackground?: CanvasBackground;
  positionMode?: PositionMode;
}

export function CanvasRenderer({
  components,
  gridRows,
  canvasBackground,
  positionMode = "grid",
}: CanvasRendererProps) {
  // Resolve background
  let bg = "var(--login-bg, hsl(var(--background)))";
  if (canvasBackground && canvasBackground.type !== "inherit" && canvasBackground.value) {
    bg = canvasBackground.value;
  }

  const visibleComponents = components.filter((c) => c.visible).sort((a, b) => a.zIndex - b.zIndex);

  const commonStyle: React.CSSProperties = {
    fontFamily: "var(--login-font-body, inherit)",
    lineHeight: "var(--login-line-height, 1.5)",
    letterSpacing: "var(--login-letter-spacing, 0px)",
  };

  // ── Free-Form (Absolute) Mode ──
  if (positionMode === "absolute") {
    return (
      <div
        className="login-page min-h-screen w-full selection:bg-primary/20"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          maxWidth: `${CANVAS_WIDTH}px`,
          margin: "0 auto",
          background: bg,
          overflow: "hidden",
          ...commonStyle,
        }}
      >
        {visibleComponents.map((comp) => (
          <div
            key={comp.id}
            style={{
              position: "absolute",
              insetInlineStart: `${comp.x}px`,
              top: `${comp.y}px`,
              width: comp.width ? `${comp.width}px` : "auto",
              height: comp.height ? `${comp.height}px` : "auto",
              zIndex: comp.zIndex,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ComponentRenderer type={comp.type} props={comp.props} />
          </div>
        ))}
      </div>
    );
  }

  // ── Grid Mode ──
  const alignMap: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
  };

  return (
    <div
      className="login-page min-h-screen w-full selection:bg-primary/20"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${CANVAS_GRID_COLUMNS}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, minmax(60px, auto))`,
        minHeight: "100vh",
        gap: "0px",
        background: bg,
        ...commonStyle,
      }}
    >
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
          <ComponentRenderer type={comp.type} props={comp.props} />
        </div>
      ))}
    </div>
  );
}
