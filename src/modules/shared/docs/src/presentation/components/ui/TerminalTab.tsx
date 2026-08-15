"use client";

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
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`docs-terminal-tab ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
