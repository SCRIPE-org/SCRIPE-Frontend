"use client";

/**
 * HubHero — Hero greeting section with animated mesh gradient.
 *
 * Layout:
 * ● All systems operational · Sunday, May 24
 * Good evening, Seif.
 * Your apps & workspaces — pick up where you left off.
 *
 * Background: 3 animated radial gradient blobs (14-18s cycles).
 */

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";

export function HubHero() {
  const { t } = useI18n();
  const adminFirstName = useAppStore((s) => s.user?.firstName ?? s.user?.username ?? "");

  const greeting = getGreeting(t);
  const dateStr = formatDate();

  return (
    <div
      style={{
        position: "relative",
        padding: "36px 0 22px",
      }}
    >
      {/* Mesh background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-20px -40px 0 -40px",
          pointerEvents: "none",
          overflow: "hidden",
          borderRadius: 36,
          opacity: 0.7,
        }}
      >
        <div
          className="nx-hub-mesh-a"
          style={{
            position: "absolute",
            top: "-30%",
            left: "-10%",
            width: 440,
            height: 440,
            background:
              "radial-gradient(closest-side, rgba(94,145,255,0.55), rgba(94,145,255,0) 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="nx-hub-mesh-b"
          style={{
            position: "absolute",
            top: "-40%",
            left: "40%",
            width: 380,
            height: 380,
            background:
              "radial-gradient(closest-side, rgba(154,77,219,0.5), rgba(154,77,219,0) 70%)",
            filter: "blur(48px)",
          }}
        />
        <div
          className="nx-hub-mesh-c"
          style={{
            position: "absolute",
            top: "-20%",
            right: "-5%",
            width: 320,
            height: 320,
            background:
              "radial-gradient(closest-side, rgba(26,183,176,0.42), rgba(26,183,176,0) 70%)",
            filter: "blur(44px)",
          }}
        />
      </div>

      <div style={{ position: "relative" }}>
        {/* Status pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
            color: "rgba(230,233,245,0.7)",
            fontSize: 11.5,
            fontWeight: 500,
            letterSpacing: "0.02em",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#11A572",
              boxShadow: "0 0 0 3px rgba(17,165,114,0.18)",
            }}
          />
          {t("workspaceHub.status.operational")} · {dateStr}
        </div>

        {/* Greeting */}
        <h1
          style={{
            margin: 0,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: "#f6f7fb",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {greeting}
          {adminFirstName ? `, ${adminFirstName}.` : "."}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 16,
            color: "rgba(230,233,245,0.62)",
            letterSpacing: "-0.005em",
          }}
        >
          {t("workspaceHub.subtitle")}
        </p>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("workspaceHub.greeting.morning");
  if (hour < 18) return t("workspaceHub.greeting.afternoon");
  return t("workspaceHub.greeting.evening");
}

function formatDate(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
