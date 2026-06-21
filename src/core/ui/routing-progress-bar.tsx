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
          width: `${progress}%`,
          // Vibrant violet-purple-indigo gradient that fits perfectly with B2B SaaS aesthetics
          background: "linear-gradient(90deg, oklch(0.6 0.18 290) 0%, oklch(0.55 0.18 275) 50%, oklch(0.65 0.18 310) 100%)",
          // Premium glowing dropshadow effect
          boxShadow: "0 1px 10px oklch(0.6 0.18 290 / 0.6), 0 0 4px oklch(0.6 0.18 290 / 0.4)",
          transition: "width 200ms ease-out",
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
