"use client";

import type { ReactNode } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Check, Globe, Lock } from "lucide-react";

interface ProtocolSelectionSectionProps {
  protocol: string;
  onChange: (protocol: string) => void;
}

// A keyboard-operable selectable card that is not a native <button> — the
// content includes a heading, which is not valid phrasing content inside a
// <button>. Same recipe as stat-card.tsx's interactive Card: role, tabIndex
// and a manual Enter/Space handler stand in for the native activation the
// element does not get for free.
function SelectableCard({
  selected,
  onSelect,
  children,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative cursor-pointer rounded-nx-lg border p-5 text-start transition-[border-color,background-color] duration-nx-standard ease-nx-enter focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Presentation UI component rendering the protocol selection section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProtocolSelectionSection({ protocol, onChange }: ProtocolSelectionSectionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="mx-auto mb-6 max-w-lg text-center">
        <h3 className="text-lg font-bold text-nx-ink">{t("oauthApps.selectProtocolTitle")}</h3>
        <p className="mt-1 text-xs text-nx-ink-2">{t("oauthApps.selectProtocolDesc")}</p>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {/* OIDC Option */}
        <SelectableCard
          selected={protocol === "oidc"}
          onSelect={() => onChange("oidc")}
          className={
            protocol === "oidc"
              ? "border-nx-accent bg-nx-accent-wash"
              : "border-nx-line bg-nx-surface hover:border-nx-line-hi"
          }
        >
          {protocol === "oidc" && (
            <div className="absolute end-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-nx-accent-fill text-nx-on-fill duration-nx-standard ease-nx-enter animate-in fade-in zoom-in-95">
              <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
            </div>
          )}
          <div
            className={cn(
              "mb-3.5 w-fit rounded-nx-md p-2.5 transition-colors duration-nx-standard ease-nx-enter motion-reduce:transition-none",
              protocol === "oidc"
                ? "bg-nx-accent-fill text-nx-on-fill"
                : "bg-nx-raised text-nx-ink-3 group-hover:bg-nx-accent-wash group-hover:text-nx-accent"
            )}
          >
            <Globe className="h-6 w-6" aria-hidden="true" />
          </div>
          <h4 className="text-sm font-bold text-nx-ink">OIDC / OAuth 2.0</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-nx-ink-2">
            {t("oauthApps.oidcChoiceDesc")}
          </p>
        </SelectableCard>

        {/* SAML Option */}
        <SelectableCard
          selected={protocol === "saml"}
          onSelect={() => onChange("saml")}
          className={
            protocol === "saml"
              ? "border-info bg-info/5"
              : "border-nx-line bg-nx-surface hover:border-info/40"
          }
        >
          {protocol === "saml" && (
            <div className="absolute end-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-info text-info-foreground duration-nx-standard ease-nx-enter animate-in fade-in zoom-in-95">
              <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
            </div>
          )}
          <div
            className={cn(
              "mb-3.5 w-fit rounded-nx-md p-2.5 transition-colors duration-nx-standard ease-nx-enter motion-reduce:transition-none",
              protocol === "saml"
                ? "bg-info/20 text-info"
                : "bg-nx-raised text-nx-ink-3 group-hover:bg-info/10 group-hover:text-info"
            )}
          >
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h4 className="text-sm font-bold text-nx-ink">SAML 2.0</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-nx-ink-2">
            {t("oauthApps.samlChoiceDesc")}
          </p>
        </SelectableCard>
      </div>
    </div>
  );
}
