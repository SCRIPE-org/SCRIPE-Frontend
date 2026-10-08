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

/**
 * Documentation for module export
 */
export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 py-1 text-xs sm:text-sm">
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {icon}
        <span className="font-medium">{label}:</span>
      </div>
      <span className="min-w-0 truncate text-end font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}
