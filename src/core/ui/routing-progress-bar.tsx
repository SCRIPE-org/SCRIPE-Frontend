"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Programmatically start the global routing progress bar.
 */
export function startRoutingProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("routing-progress-start"));
  }
}

/**
 * Programmatically complete/stop the global routing progress bar.
 */
export function stopRoutingProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("routing-progress-stop"));
  }
}

function RoutingProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);

    // Initialize animation values
    setProgress(0);
    setVisible(true);
    setOpacity(1);

    if (timer.current) clearInterval(timer.current);

    // Simulate realistic browser loading increments
    timer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + 12;
        if (prev < 60) return prev + 6;
        if (prev < 85) return prev + 1.8;
        if (prev < 95) return prev + 0.3;
        return prev;
      });
    }, 120);
  }, []);

  const done = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }

    // Instantly fill to 100%
    setProgress(100);

    // Gracefully fade out and reset
    fadeTimer.current = setTimeout(() => {
      setOpacity(0);
      fadeTimer.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300); // Duration matches the CSS opacity transition
    }, 180);
  }, []);

  // 1. Intercept global relative anchor tag clicks
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a");
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        if (!href) return;

        // Ignore external pages, protocols, anchors, new tabs, and modified key clicks
        if (
          href.startsWith("http") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("#") ||
          anchor.getAttribute("target") === "_blank" ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 // Not a standard left click
        ) {
          return;
        }

        // Avoid triggering when navigating to the exact same page/query
        const targetUrl = new URL(href, window.location.href);
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search
        ) {
          return;
        }

        startRoutingProgress();
      } catch (err) {
        // Safe fallback in case of parsing errors
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, []);

  // 2. Clear progress once the Next.js router commits the page change
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      stopRoutingProgress();
    });
    return () => cancelAnimationFrame(handle);
  }, [pathname, searchParams]);

  // 3. Listen to custom window events for manual programmatic triggering
  useEffect(() => {
    const handleStart = () => start();
    const handleDone = () => done();

    window.addEventListener("routing-progress-start", handleStart);
    window.addEventListener("routing-progress-stop", handleDone);

    return () => {
      window.removeEventListener("routing-progress-start", handleStart);
      window.removeEventListener("routing-progress-stop", handleDone);
    };
  }, [start, done]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 99999,
        pointerEvents: "none",
        opacity: opacity,
        transition: "opacity 300ms ease-in-out",
      }}
    >
      <div
        style={{
          height: "100%",
          // Scaled rather than resized: this bar animates on every navigation,
          // and width changes force layout on each frame while a transform is
          // composited. transform-origin follows the reading direction so the
          // bar fills from the side the user starts reading on.
          width: "100%",
          transform: `scaleX(${progress / 100})`,
          transformOrigin: "var(--rpb-origin, left) center",
          // Sweeps through the live workspace hue. This bar sits above every
          // page, so a fixed violet made the one piece of global chrome the
          // only thing on screen that ignored the tenant's palette.
          background:
            "linear-gradient(90deg, oklch(0.60 var(--workspace-chroma, 0.18) var(--workspace-hue, 262)) 0%, oklch(0.55 var(--workspace-chroma, 0.18) calc(var(--workspace-hue, 262) - 15)) 50%, oklch(0.66 var(--workspace-chroma, 0.18) calc(var(--workspace-hue, 262) + 20)) 100%)",
          boxShadow:
            "0 1px 10px oklch(0.60 var(--workspace-chroma, 0.18) var(--workspace-hue, 262) / 0.6), 0 0 4px oklch(0.60 var(--workspace-chroma, 0.18) var(--workspace-hue, 262) / 0.4)",
          transition: "transform 200ms ease-out",
          willChange: "transform",
        }}
      />
    </div>
  );
}

export function RoutingProgressBar() {
  return (
    <Suspense fallback={null}>
      <RoutingProgressBarInner />
    </Suspense>
  );
}
