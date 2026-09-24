"use client";

import React from "react";

/**
 * Props for displaying account attribute metadata rows with overflow protection.
 */
export interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm min-w-0 py-1">
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {icon}
        <span className="font-medium">{label}:</span>
      </div>
      <span className="font-medium text-foreground truncate min-w-0 text-end">
        {value || "—"}
      </span>
    </div>
  );
}
