/**
 * CommercialHeader Component
 *
 * Renders the top navigation bar for commercial showcase pages, with branded logo,
 * interactive mega-menu trigger buttons, global search dialog toggle, and responsive mobile actions.
 */
"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { BRAND } from "@core/config/branding";
import {
  ChevronDown,
  SearchIcon,
  DocsIcon,
  ArrowIcon,
  MenuIcon,
} from "./CommercialHeaderIcons";
import {
  NAV_SECTIONS,
  MEGA_PANEL_ID,
  sectionLabelKey,
  getPanelFocusables,
} from "./CommercialNavData";
import { CommercialMegaPanel } from "./CommercialMegaPanel";

/**
 * Properties for the CommercialHeader component.
 */
export interface CommercialHeaderProps {
  /** Callback fired when the search action or shortcut is triggered. */
  onSearchOpen: () => void;
  /** Callback fired when the mobile drawer navigation button is clicked. */
  onMobileMenuOpen: () => void;
}

/**
 * Main header component for commercial documentation and showcase routes.
 */
export function CommercialHeader({ onSearchOpen, onMobileMenuOpen }: CommercialHeaderProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { t } = useDocsI18n();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const openedByActivation = useRef(false);

  // Open mega panel for a section
  const openSection = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveSection(id);
    setPanelVisible(true);
  }, []);

  // Delayed close so mouse can travel to panel
  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setPanelVisible(false);
      setTimeout(() => setActiveSection(null), 240);
    }, 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const closePanel = useCallback((refocusId?: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPanelVisible(false);
    setTimeout(() => setActiveSection(null), 240);
    if (refocusId) {
      triggerRefs.current[refocusId]?.focus();
    }
  }, []);

  // Close on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closePanel();
  }, [pathname, closePanel]);

  // Close on Escape, returning focus to the trigger that opened the panel
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && activeSection) {
        closePanel(activeSection);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closePanel, activeSection]);

  // When the panel opens via explicit activation, move focus to first link
  useEffect(() => {
    if (panelVisible && activeSection && openedByActivation.current) {
      openedByActivation.current = false;
      const [first] = getPanelFocusables(panelRef.current);
      first?.focus();
    }
  }, [panelVisible, activeSection]);

  // Trap Tab within the open panel
  const handlePanelKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const focusables = getPanelFocusables(panelRef.current);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const activeData = NAV_SECTIONS.find((s) => s.id === activeSection);
  const activeLabel = activeData ? t(sectionLabelKey(activeData.id)) : "";

  return (
    <>
      {/* ── Single Sticky Header ──────────────────────────────────────── */}
      <header className="com-header" role="banner">
        <div className="com-header-inner">
          {/* Logo */}
          <Link
            href="/commercial"
            prefetch={false}
            className="com-header-logo"
            aria-label={t("commercialHeader.logoAria", { brand: BRAND.namePascal })}
          >
            <span className="com-header-logo-mark">
              <Image
                src="/brand/app-logo-1024.png"
                alt=""
                width={32}
                height={32}
                className="com-header-logo-img"
                aria-hidden="true"
              />
            </span>
            <span className="com-header-brand-copy">
              <span className="com-header-logo-name">{BRAND.nameUpper}</span>
              <span className="com-header-logo-badge">{t("common.commercial")}</span>
            </span>
          </Link>

          {/* Mega-menu nav triggers */}
          <nav
            className="com-nav"
            role="navigation"
            aria-label={t("commercialHeader.navAriaLabel")}
          >
            {NAV_SECTIONS.map((section) => {
              const isOpen = activeSection === section.id && panelVisible;
              return (
                <div
                  key={section.id}
                  className="com-nav-item"
                  onMouseEnter={() => openSection(section.id)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    ref={(el) => {
                      triggerRefs.current[section.id] = el;
                    }}
                    className="com-nav-trigger"
                    data-active={isOpen ? "true" : "false"}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={MEGA_PANEL_ID}
                    onClick={() => {
                      if (isOpen) {
                        closePanel(section.id);
                      } else {
                        openedByActivation.current = true;
                        openSection(section.id);
                      }
                    }}
                  >
                    {t(sectionLabelKey(section.id))}
                    <ChevronDown />
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="com-header-actions">
            {/* Search */}
            <button
              className="com-header-btn com-header-search-btn"
              onClick={onSearchOpen}
              aria-label={t("commercialHeader.searchAriaLabel")}
              id="commercial-search-trigger"
            >
              <span className="com-header-search-icon">
                <SearchIcon />
              </span>
              <span>{t("commercialHeader.searchLabel")}</span>
              <kbd className="com-header-search-shortcut">{t("common.searchShortcut")}</kbd>
            </button>

            {/* Tech docs link */}
            <Link
              href="/docs"
              prefetch={false}
              className="com-header-btn"
              aria-label={t("commercialHeader.techDocsAria")}
            >
              <DocsIcon />
              <span>{t("commercialHeader.techDocsLabel")}</span>
            </Link>

            {/* CTA */}
            <Link
              href="/commercial/pricing-showcase"
              prefetch={false}
              className="com-header-cta"
              aria-label={t("commercialHeader.pricingAria")}
            >
              {t("common.getStarted")}
              <ArrowIcon />
            </Link>

            {/* Mobile menu */}
            <button
              className="com-header-hamburger"
              onClick={onMobileMenuOpen}
              aria-label={t("commercialHeader.mobileMenuAria")}
              id="commercial-mobile-menu-btn"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mega-Menu Panel ───────────────────────────────────────────── */}
      <CommercialMegaPanel
        activeData={activeData}
        activeLabel={activeLabel}
        panelVisible={panelVisible}
        panelRef={panelRef}
        pathname={pathname}
        onCancelClose={cancelClose}
        onScheduleClose={scheduleClose}
        onKeyDown={handlePanelKeyDown}
        onClose={closePanel}
        t={t}
      />
    </>
  );
}
