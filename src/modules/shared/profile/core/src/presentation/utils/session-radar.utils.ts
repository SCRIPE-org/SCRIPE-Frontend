/**
 * Session Radar Geometry & Projection Helpers
 *
 * Pure Web Mercator coordinate projection, city coordinate fallback resolution,
 * and anti-collision pin layout utilities for `SovereignSessionRadar`.
 */

/** Radar node descriptor rendered inside `SovereignSessionRadar`. */
export interface RadarSessionNode {
  id: string;
  label?: string;
  deviceLabel?: string;
  browser?: string;
  os?: string;
  location?: string;
  city?: string;
  ipAddress: string;
  x?: number;
  y?: number;
  lat?: number;
  lon?: number;
  isCurrent: boolean;
  tlsVersion?: string;
}

/** Normalized radar node successfully mapped to SVG viewport coordinates. */
export interface PositionedRadarNode extends RadarSessionNode {
  hasCoords: true;
  cityLabel: string;
  deviceTitle: string;
  lat: number;
  lon: number;
  tls: string;
  cx: number;
  cy: number;
  lx: number;
  ly: number;
}

/** Normalized radar node lacking valid geolocation coordinates. */
export interface UnlocatedRadarNode extends RadarSessionNode {
  hasCoords: false;
  cityLabel: string;
  deviceTitle: string;
  tls: string;
}

/** Union of positioned and unlocated session nodes produced by normalization. */
export type NormalizedRadarNode = PositionedRadarNode | UnlocatedRadarNode;

const CITY_COORDINATES: Array<[string, { lat: number; lon: number }]> = [
  ["cairo", { lat: 30.0444, lon: 31.2357 }],
  ["giza", { lat: 30.0131, lon: 31.2089 }],
  ["alexandria", { lat: 31.2001, lon: 29.9187 }],
  ["london", { lat: 51.5074, lon: -0.1278 }],
  ["frankfurt", { lat: 50.1109, lon: 8.6821 }],
  ["dubai", { lat: 25.2048, lon: 55.2708 }],
];

/** Infers approximate WGS84 coordinates for recognized regional city names. */
export function inferCityCoordinates(
  cityOrLocation: string
): { lat: number; lon: number } | null {
  const lower = cityOrLocation.toLowerCase().trim();
  if (!lower) return null;
  for (const [token, coords] of CITY_COORDINATES) {
    if (lower.includes(token)) return coords;
  }
  return null;
}

/** Projects WGS84 latitude/longitude into the z=5 Mediterranean/MENA tile viewport. */
export function projectRadarPoint(lat: number, lon: number): { x: number; y: number } {
  const z = 5;
  const n = Math.pow(2, z);
  const tileX = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const tileY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  const x = (tileX - 17) * 200;
  const y = (tileY - 12) * 170;
  return {
    x: Math.max(60, Math.min(740, x)),
    y: Math.max(45, Math.min(295, y)),
  };
}

/** Normalizes session nodes with projected pin coordinates and anti-collision label offsets. */
export function normalizeRadarNodes(
  nodes: RadarSessionNode[],
  unknownGeoLabel: string,
  fallbackDeviceLabel: string
): NormalizedRadarNode[] {
  return nodes.map((node, idx) => {
    const cityLabel = (node.city || node.location || "").trim();
    const hasExplicitCoords =
      node.lat !== undefined &&
      node.lon !== undefined &&
      (Math.abs(node.lat) > 0.0001 || Math.abs(node.lon) > 0.0001);
    const coords = hasExplicitCoords
      ? { lat: node.lat as number, lon: node.lon as number }
      : inferCityCoordinates(cityLabel);

    if (!coords) {
      return {
        ...node,
        hasCoords: false,
        cityLabel: cityLabel || unknownGeoLabel,
        deviceTitle: node.deviceLabel || node.label || fallbackDeviceLabel,
        tls: node.tlsVersion || "TLS 1.3",
      };
    }

    const base = projectRadarPoint(coords.lat, coords.lon);
    const lower = cityLabel.toLowerCase();
    let labelOffsetX = 18;
    let labelOffsetY = idx % 2 === 1 ? 20 : -22;
    let pinJitterX = 0;
    let pinJitterY = 0;

    if (lower.includes("cairo")) {
      pinJitterX = 7;
      pinJitterY = -5;
      labelOffsetX = 24;
      labelOffsetY = -26;
    } else if (lower.includes("giza")) {
      pinJitterX = -9;
      pinJitterY = 9;
      labelOffsetX = -148;
      labelOffsetY = 22;
    }

    return {
      ...node,
      hasCoords: true,
      cityLabel: cityLabel || `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`,
      deviceTitle: node.deviceLabel || node.label || fallbackDeviceLabel,
      lat: coords.lat,
      lon: coords.lon,
      tls: node.tlsVersion || "TLS 1.3",
      cx: base.x + pinJitterX,
      cy: base.y + pinJitterY,
      lx: base.x + pinJitterX + labelOffsetX,
      ly: base.y + pinJitterY + labelOffsetY,
    };
  });
}
