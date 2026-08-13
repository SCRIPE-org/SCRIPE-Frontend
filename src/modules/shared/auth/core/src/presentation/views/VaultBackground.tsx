"use client";

/**
 * VaultBackground — ambient sublayer for the Vault auth layout.
 *
 * Relay vNext cinematic stage: a restrained systems-intelligence grid plus one
 * Signal Lime environmental glow that drifts slowly and continuously — per
 * DESIGN.md's explicit "tiny ambient light movement applied to the
 * container/background" allowance for Login. Replaces the retired Aurora
 * ambience (two competing-hue orbs, a scan beam, a 28-particle field) —
 * DESIGN.md bans "excessive particle effects" and "heavy particle storms,"
 * not motion itself: the difference is ONE element, slow, low-alpha, never a
 * storm. Every color comes from the `--sx-*` token layer (globals.css, themed
 * dark/light) — no hardcoded hex.
 *
 * Byte-identical to signin's copy (both consumers need the same treatment;
 * this one backs password-reset).
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
      {/* One Signal Lime environmental glow — the single committed signal,
          drifting slowly (16s) rather than sitting dead-still or storming. */}
      <div
        className="scripe-ambient-drift absolute"
        style={{
          insetInlineStart: "50%",
          top: "35%",
          width: 900,
          height: 900,
          background: "radial-gradient(circle, var(--sx-aurora-a) 0%, transparent 62%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
