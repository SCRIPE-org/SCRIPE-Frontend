"use client";

import { useState, useEffect } from "react";

/**
 * Scroll-spy hook for Table of Contents.
 * Returns the ID of the currently active heading based on scroll position.
 */
export function useTocViewModel(headingIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headingIds.length === 0) return;

    const visibleHeadings = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleHeadings.set(entry.target.id, entry.isIntersecting);
        }

        const firstVisibleId = headingIds.find((id) => visibleHeadings.get(id) === true);

        if (firstVisibleId) {
          setActiveId(firstVisibleId);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headingIds]);

  return { activeId };
}
