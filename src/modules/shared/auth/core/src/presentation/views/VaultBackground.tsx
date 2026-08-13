"use client";

/**
 * VaultBackground — the silent stage behind the Vault auth layout.
 *
 * Program-cover discipline: the typography and the mark carry the page, the
 * background stays out of the way. One static, near-imperceptible top light
 * gives the Ink ground physical depth — no grids, no pitch diagrams, no
 * drifting glows, no particles, no motion of any kind. The page's radial
 * ground itself comes from `--sx-bg-grad` on the layout root.
 *
 * Mirror of signin's copy (both consumers need the same treatment; this one
 * backs password-reset).
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
    </div>
  );
}
