"use client";

/**
 * SessionRadarBackdropSvg
 *
 * Static SVG coordinate grid and regional landmass coastline paths rendered beneath
 * interactive workstation pins in {@link SessionRadarSvgOverlay}.
 */

/** Props for {@link SessionRadarBackdropSvg}. */
export interface SessionRadarBackdropSvgProps {
  /** Selects light vs dark contrast vector fills. */
  isLight: boolean;
}

/** Renders the OpenStreetMap grid pattern and vector coastline backdrop layer. */
export function SessionRadarBackdropSvg({ isLight }: SessionRadarBackdropSvgProps) {
  const landFill = isLight ? "rgba(248, 250, 252, 0.55)" : "rgba(30, 41, 59, 0.42)";
  const landStroke = isLight ? "rgba(100, 116, 139, 0.45)" : "rgba(148, 163, 184, 0.28)";

  return (
    <>
      <defs>
        <pattern id="osmGrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path
            d="M 50 0 L 0 0 0 50"
            fill="none"
            stroke={isLight ? "rgba(15, 23, 42, 0.07)" : "rgba(196, 240, 66, 0.07)"}
            strokeWidth="0.75"
          />
        </pattern>
      </defs>

      <g pointerEvents="none">
        <path
          d="M 0 185 L 95 178 L 165 192 L 220 205 L 285 202 L 338 196 L 358 192 L 375 198 L 382 225 L 415 288 L 430 340 L 0 340 Z"
          fill={landFill}
          stroke={landStroke}
          strokeWidth="1.1"
        />
        <path
          d="M 0 0 L 800 0 L 800 135 L 640 142 L 520 148 L 435 154 L 368 152 L 332 138 L 285 146 L 235 122 L 195 142 L 155 110 L 95 128 L 35 138 L 0 132 Z"
          fill={landFill}
          stroke={landStroke}
          strokeWidth="1.1"
        />
        <path
          d="M 382 194 L 402 156 L 510 152 L 625 182 L 725 225 L 790 265 L 740 330 L 455 340 L 422 282 L 392 222 Z"
          fill={landFill}
          stroke={landStroke}
          strokeWidth="1.1"
        />
        <path
          d="M 356 193 L 348 205 L 354 235 L 362 275 L 358 340"
          fill="none"
          stroke={isLight ? "rgba(14, 165, 233, 0.45)" : "rgba(56, 189, 248, 0.32)"}
          strokeWidth="1.4"
        />
      </g>

      <rect width="800" height="340" fill="url(#osmGrid)" />
    </>
  );
}
