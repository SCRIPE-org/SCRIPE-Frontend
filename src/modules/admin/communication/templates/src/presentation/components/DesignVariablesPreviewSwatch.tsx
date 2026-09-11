/**
 * DesignVariablesPreviewSwatch — Interactive live-preview sample demonstrating current template typography and colors.
 *
 * @module templates/presentation
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { getReadableForeground, type DesignVariables } from "./designVariablesTypes";

/**
 * Properties passed to the DesignVariablesPreviewSwatch component.
 */
export interface DesignVariablesPreviewSwatchProps {
  /** Active template styling variables */
  value: DesignVariables;
}

/**
 * Renders an inline visual preview block showing header, body text, and button styling under the configured palette.
 *
 * @param props Component properties.
 * @returns JSX element rendering the mock preview card.
 */
export function DesignVariablesPreviewSwatch({ value }: DesignVariablesPreviewSwatchProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
        {t("messaging.templates.design.preview")}
      </h4>
      <div
        className="overflow-hidden rounded-nx-lg border border-nx-line"
        style={{
          backgroundColor: value.backgroundColor,
          fontFamily: value.fontFamily,
          borderRadius: `${value.borderRadius}px`,
        }}
      >
        <div className="px-4 py-3" style={{ backgroundColor: value.primaryColor }}>
          <span
            style={{
              color: getReadableForeground(value.primaryColor),
              fontSize: `${Math.min(16, parseInt(value.headerFontSize, 10) || 24)}px`,
              fontWeight: 700,
            }}
          >
            {t("messaging.templates.design.previewHeader")}
          </span>
        </div>
        <div className="px-4 py-3">
          <p
            style={{
              color: value.textColor,
              fontSize: `${value.bodyFontSize}px`,
            }}
          >
            {t("messaging.templates.design.previewBody")}
          </p>
          <div
            role="group"
            aria-label={t("messaging.templates.design.previewButton")}
            className="mt-2 inline-flex"
          >
            <span
              className="inline-flex h-9 items-center justify-center px-3 text-xs font-medium"
              style={{
                backgroundColor: value.secondaryColor,
                borderRadius: `${value.borderRadius}px`,
                color: getReadableForeground(value.secondaryColor),
              }}
            >
              {t("messaging.templates.design.previewButton")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
