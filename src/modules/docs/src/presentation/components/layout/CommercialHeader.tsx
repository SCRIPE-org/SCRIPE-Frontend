"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties, type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { BRAND } from "@core/config/branding";

// ── Navigation structure ────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    id: "why",
    label: "Why SCRIPE",
    items: [
      { href: "/commercial/why-scripe-overview",   title: "Overview",              desc: "Market positioning and differentiation" },
      { href: "/commercial/competitive-advantages", title: "Competitive Edge",      desc: "How SCRIPE wins against alternatives" },
      { href: "/commercial/target-industries",      title: "Target Industries",     desc: "Verticals and ideal customer profiles" },
      { href: "/commercial/success-metrics",        title: "Success Metrics",       desc: "ROI, KPIs, and commercial outcomes" },
      { href: "/commercial/business-client-journeys", title: "Client Journeys",    desc: "Buyer journeys from trial to expansion" },
      { href: "/commercial/workspace-tours",        title: "Workspace Tours",       desc: "Product walkthroughs and demos" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    items: [
      { href: "/commercial/platform-architecture", title: "Architecture",           desc: "Modular monolith, clean architecture" },
      { href: "/commercial/module-catalog",         title: "Module Catalog",        desc: "All available platform modules" },
      { href: "/commercial/technology-stack",       title: "Technology Stack",      desc: ".NET 10, Next.js 16, multi-DB" },
      { href: "/commercial/deployment-modes",       title: "Deployment Modes",      desc: "Cloud, on-premise, and hybrid options" },
      { href: "/commercial/system-requirements",    title: "System Requirements",   desc: "Infrastructure and scaling guidelines" },
    ],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    items: [
      { href: "/commercial/multi-tenancy",          title: "Multi-Tenancy",         desc: "Hierarchical tenant architecture" },
      { href: "/commercial/roles-permissions",      title: "Roles & Permissions",   desc: "RBAC and edition-gated access" },
      { href: "/commercial/audit-compliance",       title: "Audit & Compliance",    desc: "Trails, regulations, certifications" },
      { href: "/commercial/localization-i18n",      title: "Localization",          desc: "7 languages, RTL support, i18n" },
      { href: "/commercial/white-labeling",         title: "White-Labeling",        desc: "Full brand customization for clients" },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    items: [
      { href: "/commercial/pricing-showcase",           title: "Pricing",               desc: "Editions, plans, and pricing model" },
      { href: "/commercial/investor-overview",          title: "Investor Overview",     desc: "Funding stage, runway, cap table" },
      { href: "/commercial/partner-journey",            title: "Partner Journey",       desc: "Reseller, ISV, and SI partnerships" },
      { href: "/commercial/entitlements-subscriptions", title: "Subscription Engine",   desc: "Billing, recurring revenue, metrics" },
      { href: "/commercial/roi-analysis",               title: "ROI Analysis",          desc: "Total cost of ownership analysis" },
    ],
  },
];

// ── Icons ────────────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const DocsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

// Section icon mapper
const SECTION_ICONS: Record<string, ReactElement> = {
  why: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
    </svg>
  ),
  platform: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" />
    </svg>
  ),
  enterprise: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  commercial: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

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

  const closePanel = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPanelVisible(false);
    setTimeout(() => setActiveSection(null), 240);
  }, []);

  // Close on route change
  useEffect(() => { closePanel(); }, [pathname, closePanel]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closePanel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closePanel]);

  const activeData = NAV_SECTIONS.find((s) => s.id === activeSection);

  return (
    <>
      {/* ── Single Sticky Header ──────────────────────────────────────── */}
      <header className="com-header" role="banner">
        <div className="com-header-inner">
          {/* Logo */}
          <Link href="/commercial" className="com-header-logo" aria-label={`${BRAND.namePascal} Commercial`}>
            <span className="com-header-logo-mark">
              <img src="/app-logo.png" alt="" className="com-header-logo-img" aria-hidden="true" />
            </span>
            <span className="com-header-brand-copy">
              <span className="com-header-logo-name">{BRAND.nameUpper}</span>
              <span className="com-header-logo-badge">Commercial</span>
            </span>
          </Link>

          {/* Mega-menu nav triggers */}
          <nav className="com-nav" role="navigation" aria-label="Commercial documentation navigation">
            {NAV_SECTIONS.map((section) => (
              <div
                key={section.id}
                className="com-nav-item"
                onMouseEnter={() => openSection(section.id)}
                onMouseLeave={scheduleClose}
              >
                <button
                  className="com-nav-trigger"
                  data-active={activeSection === section.id && panelVisible ? "true" : "false"}
                  aria-expanded={activeSection === section.id && panelVisible}
                  aria-haspopup="true"
                  onClick={() => {
                    if (activeSection === section.id && panelVisible) {
                      closePanel();
                    } else {
                      openSection(section.id);
                    }
                  }}
                >
                  {section.label}
                  <ChevronDown />
                </button>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="com-header-actions">
            {/* Search */}
            <button
              className="com-header-btn com-header-search-btn"
              onClick={onSearchOpen}
              aria-label="Search commercial docs"
              id="commercial-search-trigger"
            >
              <span className="com-header-search-icon"><SearchIcon /></span>
              <span>Search docs</span>
              <kbd className="com-header-search-shortcut">⌘K</kbd>
            </button>

            {/* Tech docs link */}
            <Link href="/docs" className="com-header-btn" aria-label="Technical documentation">
              <DocsIcon />
              <span>Docs</span>
            </Link>

            {/* CTA */}
            <Link href="/commercial/pricing-showcase" className="com-header-cta" aria-label="View pricing">
              Get Started
              <ArrowIcon />
            </Link>

            {/* Mobile menu */}
            <button
              className="com-header-hamburger"
              onClick={onMobileMenuOpen}
              aria-label="Open navigation menu"
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
          className="com-mega-panel"
          data-state={panelVisible ? "open" : "closed"}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          role="region"
          aria-label={`${activeData.label} navigation`}
        >
          <div className="com-mega-panel-inner">
            {/* Panel header */}
            <div className="com-mega-panel-header">
              <span style={{ color: "var(--com-violet)", display: "flex", alignItems: "center" }}>
                {SECTION_ICONS[activeData.id]}
              </span>
              <span className="com-mega-panel-label">{activeData.label}</span>
              <div className="com-mega-panel-divider" />
            </div>

            {/* Links — 2-col grid */}
            {activeData.items.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                className="com-mega-link"
                style={{ "--di": idx } as CSSProperties}
                data-active={pathname === item.href ? "true" : "false"}
                onClick={closePanel}
              >
                <span className="com-mega-link-icon" aria-hidden="true">
                  {SECTION_ICONS[activeData.id]}
                </span>
                <span className="com-mega-link-text">
                  <span className="com-mega-link-title">{item.title}</span>
                  <span className="com-mega-link-desc">{item.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Backdrop overlay to close on outside click ────────────────── */}
      {panelVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            top: "var(--com-header-h)",
            zIndex: 98,
          }}
          onClick={closePanel}
          aria-hidden="true"
        />
      )}
    </>
  );
}