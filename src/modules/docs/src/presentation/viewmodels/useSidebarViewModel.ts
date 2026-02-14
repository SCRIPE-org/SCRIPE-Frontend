'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Sidebar ViewModel — handles open/close state for mobile.
 */
export function useSidebarViewModel() {
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

      const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), []);
      const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

      // Close on escape
      useEffect(() => {
            const handler = (e: KeyboardEvent) => {
                  if (e.key === 'Escape') closeMobileMenu();
            };
            if (isMobileMenuOpen) {
                  document.addEventListener('keydown', handler);
                  document.body.style.overflow = 'hidden';
            } else {
                  document.body.style.overflow = '';
            }
            return () => {
                  document.removeEventListener('keydown', handler);
                  document.body.style.overflow = '';
            };
      }, [isMobileMenuOpen, closeMobileMenu]);

      return {
            isMobileMenuOpen,
            openMobileMenu,
            closeMobileMenu,
      };
}
