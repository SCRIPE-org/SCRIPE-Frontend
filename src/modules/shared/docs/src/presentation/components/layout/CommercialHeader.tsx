"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
  type ReactElement,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { BRAND } from "@core/config/branding";
import Image from "next/image";

// ── Navigation structure — copy lives in commercialMegaMenu.<id>.* (pages/
// common locale). Section `id` doubles as the locale segment name, so
// rendering just interpolates `commercialMegaMenu.${id}.label` /
// `.items.${item.key}.title|desc` — no separate key bookkeeping. ──────────
const NAV_SECTIONS = [
  {
    id: "why",
    items: [
      { href: "/commercial/why-scripe-overview", key: "overview" },
      { href: "/commercial/competitive-advantages", key: "competitiveEdge" },
      { href: "/commercial/target-industries", key: "targetIndustries" },
      { href: "/commercial/success-metrics", key: "successMetrics" },
      { href: "/commercial/business-client-journeys", key: "clientJourneys" },
      { href: "/commercial/workspace-tours", key: "workspaceTours" },
    ],
  },
  {
    id: "platform",
    items: [
      { href: "/commercial/platform-architecture", key: "architecture" },
      { href: "/commercial/module-catalog", key: "moduleCatalog" },
      { href: "/commercial/technology-stack", key: "technologyStack" },
      { href: "/commercial/deployment-modes", key: "deploymentModes" },
      { href: "/commercial/system-requirements", key: "systemRequirements" },
    ],
  },
  {
    id: "enterprise",
    items: [
      { href: "/commercial/multi-tenancy", key: "multiTenancy" },
      { href: "/commercial/roles-permissions", key: "rolesPermissions" },
      { href: "/commercial/audit-compliance", key: "auditCompliance" },
      { href: "/commercial/localization-i18n", key: "localization" },
      { href: "/commercial/white-labeling", key: "whiteLabeling" },
    ],
  },
  {
    id: "commercial",
    items: [
      { href: "/commercial/pricing-showcase", key: "pricing" },
      { href: "/commercial/investor-overview", key: "investorOverview" },
      { href: "/commercial/partner-journey", key: "partnerJourney" },
      { href: "/commercial/entitlements-subscriptions", key: "subscriptionEngine" },
      { href: "/commercial/roi-analysis", key: "roiAnalysis" },
    ],
  },
] as const;

const MEGA_PANEL_ID = "commercial-mega-panel";

/** `commercialMegaMenu.<sectionId>.label` — the one place this path is built. */
function sectionLabelKey(sectionId: string): string {
  return `commercialMegaMenu.${sectionId}.label`;
}

/** `commercialMegaMenu.<sectionId>.items.<itemKey>.<field>` */
function sectionItemKey(sectionId: string, itemKey: string, field: "title" | "desc"): string {
  return `commercialMegaMenu.${sectionId}.items.${itemKey}.${field}`;
}

// ── Icons ────────────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const DocsIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

// Section icon mapper — decorative, aria-hidden at every render site.
const SECTION_ICONS: Record<string, ReactElement> = {
  why: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4m0-4h.01" />
    </svg>
  ),
  platform: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  ),
  enterprise: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  commercial: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

/** All focusable links/buttons inside the mega panel, in DOM order. */
function getPanelFocusables(panel: HTMLElement | null): HTMLElement[] {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
}

// ── Main Component ────────────────────────────────────────────────────────

interface CommercialHeaderProps {
  onSearchOpen: () => void;
  onMobileMenuOpen: () => void;
}

export function CommercialHeader({ onSearchOpen, onMobileMenuOpen }: CommercialHeaderProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { t } = useDocsI18n();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // True only when the panel was opened by an explicit activation (click or
  // keyboard Enter/Space on the trigger button), never by a hover — so
  // mouse users browsing the nav don't have focus yanked out from under them.
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

  // Close on route change — synchronizes panel visibility with the router's
  // pathname, an external system, which is exactly the sanctioned use of an
  // effect this lint rule itself carves out an exception for.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closePanel();
  }, [pathname, closePanel]);

  // Close on Escape, returning focus to the trigger that opened the panel —
  // Escape must never leave the user's keyboard focus stranded on a node
  // that just disappeared.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeSection) {
        closePanel(activeSection);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closePanel, activeSection]);

  // When the panel opens via explicit activation (not hover), move focus to
  // its first link — otherwise DOM tab order would skip straight from this
  // trigger to the NEXT trigger button, since the panel is a sibling that
  // renders after the whole header, not inside this nav item.
  useEffect(() => {
    if (panelVisible && activeSection && openedByActivation.current) {
      openedByActivation.current = false;
      const [first] = getPanelFocusables(panelRef.current);
      first?.focus();
    }
  }, [panelVisible, activeSection]);

  // Trap Tab within the open panel so keyboard users can't tab "through" it
  // into whatever renders after it in the document.
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
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
              <Image src="/brand/app-logo-1024.png" alt="" width={32} height={32} className="com-header-logo-img" aria-hidden="true" />
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
      {activeData && (
        <div
          id={MEGA_PANEL_ID}
          ref={panelRef}
          className="com-mega-panel"
          data-state={panelVisible ? "open" : "closed"}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onKeyDown={handlePanelKeyDown}
          role="region"
          aria-label={t("commercialHeader.megaPanelAria", { label: activeLabel })}
        >
          <div className="com-mega-panel-inner">
            {/* Panel header */}
            <div className="com-mega-panel-header">
              <span style={{ color: "var(--com-violet)", display: "flex", alignItems: "center" }}>
                {SECTION_ICONS[activeData.id]}
              </span>
              <span className="com-mega-panel-label">{activeLabel}</span>
              <div className="com-mega-panel-divider" />
            </div>

            {/* Links — 2-col grid */}
            {activeData.items.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="com-mega-link"
                style={{ "--di": idx } as CSSProperties}
                data-active={pathname === item.href ? "true" : "false"}
                onClick={() => closePanel()}
              >
                <span className="com-mega-link-icon" aria-hidden="true">
                  {SECTION_ICONS[activeData.id]}
                </span>
                <span className="com-mega-link-text">
                  <span className="com-mega-link-title">
                    {t(sectionItemKey(activeData.id, item.key, "title"))}
                  </span>
                  <span className="com-mega-link-desc">
                    {t(sectionItemKey(activeData.id, item.key, "desc"))}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Backdrop overlay to close on outside click — declared as a real
          class in commercial.css (§8 / §22 z-index stack) instead of an
          inline literal, so its stacking order lives next to its siblings. */}
      {panelVisible && (
        <div className="com-mega-backdrop" onClick={() => closePanel()} aria-hidden="true" />
      )}
    </>
  );
}
