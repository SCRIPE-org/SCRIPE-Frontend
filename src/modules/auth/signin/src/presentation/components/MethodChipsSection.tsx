"use client";

import React from "react";
import { Button } from "@core/ui/button";

interface MethodChip {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface MethodChipsSectionProps {
  methodChips: MethodChip[];
  isLoading: boolean;
  t: (key: string) => string;
}

export function MethodChipsSection({ methodChips, isLoading, t }: MethodChipsSectionProps) {
  if (methodChips.length === 0) return null;

  return (
    <div>
      <div
        className="mb-2.5 text-center text-[11px] font-medium uppercase tracking-[0.15em]"
        style={{
          color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.5))",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
        }}
      >
        {t("auth.otherMethods") || "or use a different method"}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {methodChips.map((chip) => (
          <Button
            key={chip.key}
            type="button"
            variant="outline"
            size="sm"
            onClick={chip.onClick}
            disabled={isLoading}
            data-method-chip
            className="inline-flex items-center gap-1.5 rounded-full px-[11px] py-[7px] text-[12px] font-medium transition-all duration-150"
            style={{
              background: "var(--sx-chip-bg, rgba(255,255,255,0.03))",
              borderColor: "var(--sx-chip-border, rgba(255,255,255,0.08))",
              color: "var(--sx-text-mute)",
            }}
          >
            <span style={{ color: "var(--sx-accent-text)", display: "inline-flex" }}>
              {chip.icon}
            </span>
            <span>{chip.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
