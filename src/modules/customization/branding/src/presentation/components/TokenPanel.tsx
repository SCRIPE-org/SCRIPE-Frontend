/**
 * TokenPanel — Design token editor (colors, typography, spacing)
 *
 * Per analysis §10: Semantic tokens → Component tokens → CSS Variables
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
  label: string;
  tokens: { key: string; label: string; type: "color" | "text"; placeholder: string }[];
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    label: "Colors",
    tokens: [
      { key: "color.primary", label: "Primary", type: "color", placeholder: "#6366f1" },
      { key: "color.surface", label: "Surface", type: "color", placeholder: "#ffffff" },
      { key: "color.accent", label: "Accent", type: "color", placeholder: "#8b5cf6" },
      { key: "bg.color", label: "Background", type: "color", placeholder: "#0f172a" },
      { key: "overlay.opacity", label: "Overlay Opacity", type: "text", placeholder: "0.5" },
    ],
  },
  {
    label: "Typography",
    tokens: [
      { key: "font.body", label: "Body Font", type: "text", placeholder: "Inter" },
      { key: "font.heading", label: "Heading Font", type: "text", placeholder: "Inter" },
      { key: "text.color", label: "Text Color", type: "color", placeholder: "#f8fafc" },
      { key: "text.muted", label: "Muted Text", type: "color", placeholder: "#94a3b8" },
    ],
  },
  {
    label: "Shape & Spacing",
    tokens: [
      { key: "radius.card", label: "Card Radius", type: "text", placeholder: "16px" },
      { key: "radius.button", label: "Button Radius", type: "text", placeholder: "8px" },
      { key: "radius.input", label: "Input Radius", type: "text", placeholder: "8px" },
    ],
  },
];

export function TokenPanel({ tokens, updateToken }: TokenPanelProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("tenantSettings.customization.designTokens")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("tenantSettings.customization.tokensDescription")}
        </p>
      </div>

      {TOKEN_GROUPS.map((group) => (
        <div key={group.label} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h4>
          <div className="space-y-2">
            {group.tokens.map((token) => (
              <div key={token.key} className="flex items-center gap-2">
                {token.type === "color" && (
                  <input
                    type="color"
                    value={tokens[token.key] || token.placeholder}
                    onChange={(e) => updateToken(token.key, e.target.value)}
                    className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border"
                  />
                )}
                <Label className="w-24 shrink-0 text-xs text-muted-foreground">{token.label}</Label>
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
