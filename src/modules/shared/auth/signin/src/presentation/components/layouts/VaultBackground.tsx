"use client";

import { useMemo } from "react";

/**
 * VaultBackground — ambient sublayer for the Vault auth layout.
 *
 * Renders: a masked grid overlay, two drifting aurora orbs, a scan beam, and a
 * field of deterministically-seeded particles. Every color comes from the
 * `--sx-*` token layer (defined in globals.css, themed dark/light) — no hardcoded
 * hex. All motion lives under the `.sx-ambient` class so the global
 * `prefers-reduced-motion` / `[data-reduced-motion]` guard can disable it.
 *
 * Particles are seeded (no Math.random) so SSR and client markup match.
 * Source of truth: Scripe_claude_design/Scripe/scripe-vault.jsx → VaultBackground.
 */
export function VaultBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => {
        const seed = (i * 7919) % 100;
        return {
          i,
          left: (seed * 11) % 100,
          top: (seed * 13) % 100,
          kind: i % 3,
          opacity: 0.35 + (seed % 50) / 100,
          dur: 6 + (seed % 8),
          delay: seed % 5,
        };
      }),
    []
  );

  return (
    <div className="sx-ambient pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Masked grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--sx-grid-stroke) 1px, transparent 1px), linear-gradient(90deg, var(--sx-grid-stroke) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)",
        }}
      />
      {/* Aurora orb A */}
      <div
        className="absolute"
        style={{
          insetInlineStart: "5%",
          top: "20%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, var(--sx-aurora-a) 0%, transparent 60%)",
          filter: "blur(40px)",
          animation: "sxDrift 18s ease-in-out infinite",
        }}
      />
      {/* Aurora orb B */}
      <div
        className="absolute"
        style={{
          insetInlineEnd: "8%",
          bottom: "8%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, var(--sx-aurora-b) 0%, transparent 60%)",
          filter: "blur(40px)",
          animation: "sxDrift 22s ease-in-out infinite reverse",
        }}
      />
      {/* Scan beam */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "40%",
          background: "var(--sx-scan-line)",
          animation: "sxScan 9s linear infinite",
        }}
      />
      {/* Particles */}
      {particles.map((p) => {
        const color =
          p.kind === 0
            ? "var(--sx-particle-1)"
            : p.kind === 1
              ? "var(--sx-particle-2)"
              : "var(--sx-particle-3)";
        return (
          <div
            key={p.i}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: 2,
              height: 2,
              background: color,
              color,
              opacity: p.opacity,
              boxShadow: "0 0 6px currentColor",
              animation: `sxFloat ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
