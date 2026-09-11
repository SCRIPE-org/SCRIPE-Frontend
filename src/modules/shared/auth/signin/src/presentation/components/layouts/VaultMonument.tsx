/**
 * VaultMonument — 3D Relay Grid monument display for the showroom auth layout.
 * Renders tilt-reactive perspective, grounded static Signal Lime lighting, contact shadow,
 * one-time highlight sweep, and mirrored floor reflection.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Renders the 3D Relay Grid monument with interactive pointer tilt and staging reflections.
 *
 * @returns Monument container element with motion and lighting effects.
 */
export function VaultMonument() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: py * -4, y: px * 4 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const markStyle = {
    width: "clamp(340px, 32vw, 520px)",
    height: "auto",
    transform: "translateX(-2.3%)",
  } as const;

  return (
    <div
      ref={wrapRef}
      className="scripe-monument scripe-monument-settle relative flex justify-center"
      style={{ perspective: 900 }}
    >
      {/* Grounded stage light — static Signal Lime glow */}
      <div
        aria-hidden="true"
        className="scripe-stage-light pointer-events-none absolute"
        style={{
          left: "50%",
          bottom: "4%",
          transform: "translateX(-50%)",
          width: "85%",
          height: "60%",
          background: "radial-gradient(ellipse, rgba(198, 255, 0, 0.16) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      <div
        className="relative"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 200ms var(--scripe-ease-out, cubic-bezier(0.16, 1, 0.3, 1))",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Contact shadow */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: "50%",
            bottom: "10.5%",
            transform: "translateX(-50%)",
            width: "58%",
            height: 30,
            background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.32) 0%, transparent 68%)",
            filter: "blur(10px)",
          }}
        />
        <div className="relative overflow-hidden">
          <Image
            src="/brand/auth/login-relay-grid-3d.png"
            alt=""
            width={400}
            height={400}
            sizes="(min-width: 1024px) 520px, 400px"
            priority
            className="relative object-contain"
            style={markStyle}
            aria-hidden="true"
          />
          {/* Highlight sweep */}
          <div
            aria-hidden="true"
            className="scripe-highlight-sweep pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(75deg, transparent 40%, rgba(255, 255, 255, 0.22) 50%, transparent 60%)",
            }}
          />
        </div>
        {/* Floor reflection */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-full w-full"
          style={{
            transform: "scaleY(-1)",
            marginTop: "-4%",
            opacity: 0.16,
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 65%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 65%)",
          }}
        >
          <Image
            src="/brand/auth/login-relay-grid-3d.png"
            alt=""
            width={400}
            height={400}
            sizes="(min-width: 1024px) 520px, 400px"
            priority
            className="relative object-contain"
            style={markStyle}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
