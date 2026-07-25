// UI-EXCEPTION: compact studio layout — the bare <input type="color"> swatch
// reuses ColorInput's own token recipe (see that file's UI-EXCEPTION note) but
// stays inline with the row's own label + raw-value text field.
/**
 * TokenPanel — Design token editor (colors, typography, spacing)
 *
 * Per analysis §10: Semantic tokens to Component tokens to CSS Variables
 * Token categories: Color, Typography, Spacing, Radius, Elevation
 */
"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";

interface TokenPanelProps {
  tokens: Record<string, string>;
  updateToken: (key: string, value: string) => void;
}

interface TokenGroup {
  labelKey: string;
  tokens: { key: string; labelKey: string; type: "color" | "text"; placeholder: string }[];
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    labelKey: "studio.tokenPanel.groupColors",
    tokens: [
      {
        key: "color.primary",
        labelKey: "studio.tokenPanel.colorPrimary",
        type: "color",
        placeholder: "#6366f1",
      },
      {
        key: "color.surface",
        labelKey: "studio.tokenPanel.colorSurface",
        type: "color",
        placeholder: "#ffffff",
      },
      {
        key: "color.accent",
        labelKey: "studio.tokenPanel.colorAccent",
        type: "color",
        placeholder: "#8b5cf6",
      },
      {
        key: "bg.color",
        labelKey: "studio.tokenPanel.colorBackground",
        type: "color",
        placeholder: "#0f172a",
      },
      {
        key: "overlay.opacity",
        labelKey: "studio.tokenPanel.overlayOpacity",
        type: "text",
        placeholder: "0.5",
      },
    ],
  },
  {
    labelKey: "studio.tokenPanel.groupTypography",
    tokens: [
      {
        key: "font.body",
        labelKey: "studio.tokenPanel.fontBody",
        type: "text",
        placeholder: "Inter",
      },
      {
        key: "font.heading",
        labelKey: "studio.tokenPanel.fontHeading",
        type: "text",
        placeholder: "Inter",
      },
      {
        key: "text.color",
        labelKey: "studio.tokenPanel.textColor",
        type: "color",
        placeholder: "#f8fafc",
      },
      {
        key: "text.muted",
        labelKey: "studio.tokenPanel.mutedText",
        type: "color",
        placeholder: "#94a3b8",
      },
    ],
  },
  {
    labelKey: "studio.tokenPanel.groupShape",
    tokens: [
      {
        key: "radius.card",
        labelKey: "studio.tokenPanel.radiusCard",
        type: "text",
        placeholder: "16px",
      },
      {
        key: "radius.button",
        labelKey: "studio.tokenPanel.radiusButton",
        type: "text",
        placeholder: "8px",
      },
      {
        key: "radius.input",
        labelKey: "studio.tokenPanel.radiusInput",
        type: "text",
        placeholder: "8px",
      },
    ],
  },
];

/**
 * Presentation UI component rendering the token panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TokenPanel({ tokens, updateToken }: TokenPanelProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold text-nx-ink">
          {t("tenantSettings.customization.designTokens")}
        </h3>
        <p className="mt-1 text-xs text-nx-ink-3">
          {t("tenantSettings.customization.tokensDescription")}
        </p>
      </div>

      {TOKEN_GROUPS.map((group) => (
        <div key={group.labelKey} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t(group.labelKey)}
          </h4>
          <div className="space-y-2">
            {group.tokens.map((token) => (
              <div key={token.key} className="flex items-center gap-2">
                {token.type === "color" && (
                  <input
                    type="color"
                    aria-label={t(token.labelKey)}
                    value={tokens[token.key] || token.placeholder}
                    onChange={(e) => updateToken(token.key, e.target.value)}
                    className="h-7 w-7 shrink-0 cursor-pointer rounded-nx-control border border-nx-line bg-transparent p-0.5 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-nx-sm [&::-webkit-color-swatch]:border-0"
                  />
                )}
                <Label className="w-24 shrink-0 text-xs text-nx-ink-3">{t(token.labelKey)}</Label>
                <Input
                  value={tokens[token.key] || ""}
                  onChange={(e) => updateToken(token.key, e.target.value)}
                  placeholder={token.placeholder}
                  className="h-7 flex-1 font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
