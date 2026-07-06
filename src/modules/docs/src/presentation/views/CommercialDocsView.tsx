"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDocsViewModel } from "../viewmodels/useDocsViewModel";
import { useSidebarViewModel } from "../viewmodels/useSidebarViewModel";
import { useSearchViewModel } from "../viewmodels/useSearchViewModel";
import { useDocsI18n } from "../providers/DocsI18nProvider";

// Commercial layout components
import { CommercialHeader } from "../components/layout/CommercialHeader";
import { CommercialContent } from "../components/content/CommercialContent";
import { CommercialHomeLanding } from "./CommercialHomeLanding";

// Shared components
import { DocsPrevNext } from "../components/layout/DocsPrevNext";
import { DocsMobileNav } from "../components/layout/DocsMobileNav";
import { ReadingProgress } from "../components/ui/ReadingProgress";
import { DocsSearch } from "../components/ui/DocsSearch";

// CommercialSubNav is intentionally omitted — replaced by the mega-menu in CommercialHeader

// ── Props ──────────────────────────────────────────────────────────────────
interface CommercialDocsViewProps {
  slug: string;
}

// ── Footer ─────────────────────────────────────────────────────────────────
function CommercialFooter() {
  const { t } = useDocsI18n();

  const footerCols = [
    {
      title: "Why SCRIPE",
      links: [
        { href: "/commercial/why-scripe-overview", label: "Overview" },
        { href: "/commercial/competitive-advantages", label: "Competitive Edge" },
        { href: "/commercial/target-industries", label: "Industries" },
        { href: "/commercial/business-client-journeys", label: "Client Journeys" },
      ],
    },
    {
      title: "Platform",
      links: [
        { href: "/commercial/platform-architecture", label: "Architecture" },
        { href: "/commercial/module-catalog", label: "Module Catalog" },
        { href: "/commercial/technology-stack", label: "Tech Stack" },
        { href: "/commercial/deployment-modes", label: "Deployment" },
      ],
    },
    {
      title: "Commercial",
      links: [
        { href: "/commercial/pricing-showcase", label: "Pricing" },
        { href: "/commercial/investor-overview", label: "Investors" },
        { href: "/commercial/partner-program", label: "Partners" },
        { href: "/commercial/roi-calculator", label: "ROI Calculator" },
      ],
    },
  ];

  return (
    <footer className="com-footer" role="contentinfo">
      <div className="com-footer-inner">
        <div className="com-footer-grid">
          {/* Brand column */}
          <div className="com-footer-brand">
            <Link
              href="/commercial"
              className="com-footer-logo"
              aria-label="SCRIPE Commercial home"
            >
              <img
                src="/app-logo.png"
                alt="SCRIPE"
                style={{ width: 24, height: 24, objectFit: "contain" }}
              />
              <span>SCRIPE</span>
            </Link>
            <p className="com-footer-tagline">
              Enterprise-grade modular SaaS platform. B2B2C subscription infrastructure built for
              scale.
            </p>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="com-footer-col-title">{col.title}</h4>
              <ul className="com-footer-links" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="com-footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="com-footer-bottom">
          <p className="com-footer-copy">
            &copy; {new Date().getFullYear()} SCRIPE. All rights reserved.
          </p>
          <div className="com-footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <Link href="/docs">Developer Docs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main View ──────────────────────────────────────────────────────────────
/**
 * Presentation UI component rendering the commercial docs view.
 * Single-header layout — CommercialSubNav has been retired; mega-menu in CommercialHeader replaces it.
 * Universal horizontal padding applied via com-content-wrap / --com-gutter on all containers.
 */
export function CommercialDocsView({ slug }: CommercialDocsViewProps) {
  const { direction, loadSection } = useDocsI18n();
  const vm = useDocsViewModel(slug, "commercial");
  const sidebar = useSidebarViewModel();
  const search = useSearchViewModel(vm.search);

  // Lazy-load the section locale for the current commercial page
  useEffect(() => {
    loadSection(slug);
  }, [slug, loadSection]);

  // ── 404 ────────────────────────────────────────────────────────────────
  if (vm.isNotFound) {
    return (
      <div className="commercial-root" dir={direction}>
        <CommercialHeader
          onSearchOpen={search.openSearch}
          onMobileMenuOpen={sidebar.openMobileMenu}
        />
        <div className="commercial-page">
          <div className="com-404" role="main">
            <h1>404</h1>
            <p>Page not found: /commercial/{slug.replace("commercial/", "")}</p>
            <Link
              href="/commercial"
              className="com-btn com-btn--ghost"
              style={{ marginTop: "1rem" }}
            >
              Back to Commercial Home
            </Link>
          </div>
        </div>
        <CommercialFooter />
      </div>
    );
  }

  const page = vm.page!;

  // ── Landing layout (commercial homepage / section overviews) ─────────────
  if (page.layout === "landing") {
    return (
      <div className="commercial-root" dir={direction}>
        <CommercialHeader
          onSearchOpen={search.openSearch}
          onMobileMenuOpen={sidebar.openMobileMenu}
        />
        <main className="commercial-page" id="main-content" role="main">
          <CommercialHomeLanding />
        </main>
        <CommercialFooter />

        <DocsSearch
          isOpen={search.isSearchOpen}
          onClose={search.closeSearch}
          onSearch={search.searchFn}
          basePath="/commercial"
        />
        <DocsMobileNav
          categories={vm.categories}
          activeSlug={slug}
          isOpen={sidebar.isMobileMenuOpen}
          onClose={sidebar.closeMobileMenu}
          basePath="/commercial"
        />
      </div>
    );
  }

  // ── Standard content page layout ───────────────────────────────────────
  return (
    <div className="commercial-root" dir={direction}>
      <ReadingProgress />
      <CommercialHeader
        onSearchOpen={search.openSearch}
        onMobileMenuOpen={sidebar.openMobileMenu}
      />

      <main className="commercial-page" id="main-content" role="main">
        <CommercialContent
          sections={page.sections}
          titleKey={page.titleKey}
          descriptionKey={page.descriptionKey}
          lastUpdated={page.lastUpdated}
          categoryInfo={vm.categoryInfo}
        />

        <div style={{ padding: "0 var(--com-gutter)" }}>
          <div style={{ maxWidth: "var(--com-max)", margin: "0 auto" }}>
            <DocsPrevNext
              prevSlug={vm.prevSlug}
              prevTitleKey={vm.prevTitleKey}
              nextSlug={vm.nextSlug}
              nextTitleKey={vm.nextTitleKey}
              basePath="/commercial"
            />
          </div>
        </div>
      </main>

      <CommercialFooter />

      {/* Overlays */}
      <DocsSearch
        isOpen={search.isSearchOpen}
        onClose={search.closeSearch}
        onSearch={search.searchFn}
        basePath="/commercial"
      />
      <DocsMobileNav
        categories={vm.categories}
        activeSlug={slug}
        isOpen={sidebar.isMobileMenuOpen}
        onClose={sidebar.closeMobileMenu}
        basePath="/commercial"
      />
    </div>
  );
}
