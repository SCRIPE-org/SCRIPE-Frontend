'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Scroll-spy hook for Table of Contents.
 * Returns the ID of the currently active heading based on scroll position.
 */
export function useTocViewModel(headingIds: string[]) {
      const [activeId, setActiveId] = useState<string | null>(null);

      useEffect(() => {
            if (headingIds.length === 0) return;

            const observer = new IntersectionObserver(
                  (entries) => {
                        // Find the first visible heading
                        const visible = entries
                              .filter((e) => e.isIntersecting)
                              .sort((a, b) => {
                                    return a.boundingClientRect.top - b.boundingClientRect.top;
                              });

                        if (visible.length > 0) {
                              setActiveId(visible[0].target.id);
                        }
                  },
                  {
                        rootMargin: '-80px 0px -70% 0px',
                        threshold: 0,
                  }
            );

            // Observe all headings
            for (const id of headingIds) {
                  const el = document.getElementById(id);
                  if (el) observer.observe(el);
            }

            return () => observer.disconnect();
      }, [headingIds]);

      return { activeId };
}
