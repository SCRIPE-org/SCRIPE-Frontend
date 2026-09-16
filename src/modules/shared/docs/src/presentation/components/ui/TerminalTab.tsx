"use client";

import { Button } from "@core/ui/button";

interface TerminalTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * TerminalTab — one tab in the fake terminal window's tab strip.
 * Carries the ARIA tab role so assistive tech announces which transcript is
 * currently shown; focus order stays native (plain Tab), so a screen reader
 * user still reaches every tab without a custom roving-tabindex handler.
 */
export function TerminalTab({ label, isActive, onClick }: TerminalTabProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      role="tab"
      aria-selected={isActive}
      className={`docs-terminal-tab h-auto p-0 hover:bg-transparent ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
