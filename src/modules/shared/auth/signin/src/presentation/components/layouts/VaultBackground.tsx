"use client";

/**
 * VaultBackground — ambient sublayer for the Vault auth layout.
 *
 * Relay vNext cinematic stage: a restrained systems-intelligence grid plus one
 * static Signal Lime environmental glow. Replaces the retired Aurora ambience
 * (drifting violet/cyan orbs, a scan beam, a 28-particle field) — DESIGN.md
 * bans "excessive particle effects" and treats Login's cinematic exception as
 * one deliberate signal, not ambient decoration. What remains is genuinely
 * static (no `sxDrift`/`sxScan`/`sxFloat` loops); the container-level intro
 * reveal lives on the logo block itself, gated by `prefers-reduced-motion`
 * there. Every color comes from the `--sx-*` token layer (globals.css, themed
 * dark/light) — no hardcoded hex.
 */
export function VaultBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Systems-intelligence grid — abstract structure, not brand colour */}
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
      {/* One static Signal Lime environmental glow — the single committed signal */}
      <div
        className="absolute"
        style={{
          insetInlineStart: "50%",
          top: "35%",
          width: 900,
          height: 900,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, var(--sx-aurora-a) 0%, transparent 62%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
