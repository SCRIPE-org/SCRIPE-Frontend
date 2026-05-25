"use client";

/**
 * HubSectionHeader — Reusable section header for Hub page sections.
 * Pattern: [icon] TITLE subtitle        [action]
 */

import React from "react";

interface HubSectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function HubSectionHeader({ icon, title, subtitle, action }: HubSectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "0 0 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        {icon}
        <h2
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(230,233,245,0.55)",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <span
            style={{
              fontSize: 12,
              color: "rgba(230,233,245,0.4)",
              letterSpacing: "-0.005em",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
