"use client";

interface TerminalTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function TerminalTab({ label, isActive, onClick }: TerminalTabProps) {
  return (
    <button
      className={`docs-terminal-tab ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
