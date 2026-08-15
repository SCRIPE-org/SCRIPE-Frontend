"use client";

/**
 * VaultBackground — the silent stage behind the Vault auth layout.
 *
 * Program-cover discipline: the typography and the mark carry the page, the
 * background stays out of the way. DESIGN.md §15 calls for this component to
 * carry "a restrained, static Signal Lime environmental glow" — the same
 * recipe `.scripe-auth-stage` already uses for the auth error/loading
 * states — so the whole vault stage (not just the monument's own local
 * light) reads as lit, not flat black. No grids, no pitch diagrams, no
 * drifting glows, no particles: the glow is static, never animated. The
 * page's radial ground itself comes from `--sx-bg-grad` on the layout root.
 */
export function VaultBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "38%",
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(75% 55% at 50% 35%, rgba(198, 255, 0, 0.1), transparent 62%)",
        }}
      />
    </div>
  );
}
