"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ViewBox, DEFAULT_VB, EnrichedCountryData } from "./types";
import {
  calculateZoomViewBox,
  calculateCountryViewBox,
  safeReleaseCapture,
} from "./cameraCalculations";

export function useMapPanZoom() {
  const [vb, setVb] = useState<ViewBox>(DEFAULT_VB);
  const vbRef = useRef<ViewBox>(DEFAULT_VB);
  useEffect(() => {
    vbRef.current = vb;
  }, [vb]);

  const animFrameRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const [selectedCountry, setSelectedCountry] = useState<EnrichedCountryData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{
    country: EnrichedCountryData;
    x: number;
    y: number;
  } | null>(null);

  const mapStageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ clientX: 0, clientY: 0, vbX: DEFAULT_VB.x, vbY: DEFAULT_VB.y });

  // Global window pointer release listener to prevent any drag stickiness
  useEffect(() => {
    const handleGlobalRelease = () => {
      isDraggingRef.current = false;
    };
    const events = ["pointerup", "pointercancel", "mouseup"] as const;
    events.forEach((ev) => window.addEventListener(ev, handleGlobalRelease));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleGlobalRelease));
    };
  }, []);

  // Camera smooth zoom & pan with robust rAF animation loop
  const animateToViewBox = useCallback((target: ViewBox) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    const start = { ...vbRef.current };
    const t0 = performance.now();
    const dur = 360;

    function step(now: number) {
      const u = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - u, 3);
      const nextVb: ViewBox = {
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        w: start.w + (target.w - start.w) * e,
        h: start.h + (target.h - start.h) * e,
      };
      vbRef.current = nextVb;
      setVb(nextVb);
      if (u < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    }
    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  const zoomAt = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      if (!mapStageRef.current) return;
      const rect = mapStageRef.current.getBoundingClientRect();
      const target = calculateZoomViewBox(vbRef.current, rect, factor, clientX, clientY);
      animateToViewBox(target);
    },
    [animateToViewBox]
  );

  const resetMap = useCallback(() => {
    animateToViewBox(DEFAULT_VB);
    setSelectedCountry(null);
  }, [animateToViewBox]);

  const fitCountry = useCallback(
    (country: EnrichedCountryData) => {
      isDraggingRef.current = false;
      hasDraggedRef.current = false;
      if (!mapStageRef.current) return;
      const rect = mapStageRef.current.getBoundingClientRect();
      const target = calculateCountryViewBox(country, rect);
      animateToViewBox(target);
    },
    [animateToViewBox]
  );

  const handleCountrySelect = useCallback(
    (country: EnrichedCountryData, focus = true) => {
      isDraggingRef.current = false;
      hasDraggedRef.current = false;
      setSelectedCountry(country);
      if (focus) {
        fitCountry(country);
      }
    },
    [fitCountry]
  );

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      vbX: vbRef.current.x,
      vbY: vbRef.current.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        safeReleaseCapture(svgRef.current, e.pointerId);
      }
      return;
    }

    if (!isDraggingRef.current || !mapStageRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;
    const distSq = dx * dx + dy * dy;
    if (distSq > 64) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setHoveredCountry(null);
        try {
          svgRef.current?.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
      const rect = mapStageRef.current.getBoundingClientRect();
      const newX = dragStartRef.current.vbX - (dx / rect.width) * vbRef.current.w;
      const newY = dragStartRef.current.vbY - (dy / rect.height) * vbRef.current.h;
      const nextVb = { ...vbRef.current, x: newX, y: newY };
      vbRef.current = nextVb;
      setVb(nextVb);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = false;
    safeReleaseCapture(svgRef.current, e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    zoomAt(factor, e.clientX, e.clientY);
  };

  return {
    vb,
    mapStageRef,
    svgRef,
    isDraggingRef,
    hasDraggedRef,
    selectedCountry,
    setSelectedCountry,
    hoveredCountry,
    setHoveredCountry,
    resetMap,
    zoomAt,
    handleCountrySelect,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  };
}
