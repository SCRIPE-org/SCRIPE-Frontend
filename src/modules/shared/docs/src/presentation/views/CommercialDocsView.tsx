"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDocsViewModel } from "../viewmodels/useDocsViewModel";
import { useSidebarViewModel } from "../viewmodels/useSidebarViewModel";
import { useSearchViewModel } from "../viewmodels/useSearchViewModel";
import { useDocsI18n } from "../providers/DocsI18nProvider";
import { BRAND } from "@core/config/branding";

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

  // Labels reuse the mega-menu's own titleKeys (same destination, same
  // copy) instead of duplicating strings under a second key. This also
  // fixed two footer links that pointed at slugs with no content
  // ("/commercial/partner-program", "/commercial/roi-calculator") — they
  // now resolve to the real pages the header mega-menu already links to.
  const footerCols = [
    {
      titleKey: "commercialMegaMenu.why.label",
      links: [
        { href: "/commercial/why-scripe-overview", labelKey: "commercialMegaMenu.why.items.overview.title" },
        {
          href: "/commercial/competitive-advantages",
          labelKey: "commercialMegaMenu.why.items.competitiveEdge.title",
        },
        {
          href: "/commercial/target-industries",
          labelKey: "commercialMegaMenu.why.items.targetIndustries.title",
        },
        {
          href: "/commercial/business-client-journeys",
          labelKey: "commercialMegaMenu.why.items.clientJourneys.title",
        },
      ],
    },
    {
      titleKey: "commercialMegaMenu.platform.label",
      links: [
        {
          href: "/commercial/platform-architecture",
          labelKey: "commercialMegaMenu.platform.items.architecture.title",
        },
        {
          href: "/commercial/module-catalog",
          labelKey: "commercialMegaMenu.platform.items.moduleCatalog.title",
        },
        {
          href: "/commercial/technology-stack",
          labelKey: "commercialMegaMenu.platform.items.technologyStack.title",
        },
        {
          href: "/commercial/deployment-modes",
          labelKey: "commercialMegaMenu.platform.items.deploymentModes.title",
        },
      ],
    },
    {
      titleKey: "commercialMegaMenu.commercial.label",
      links: [
        {
          href: "/commercial/pricing-showcase",
          labelKey: "commercialMegaMenu.commercial.items.pricing.title",
        },
        {
          href: "/commercial/investor-overview",
          labelKey: "commercialMegaMenu.commercial.items.investorOverview.title",
        },
        {
          href: "/commercial/partner-journey",
          labelKey: "commercialMegaMenu.commercial.items.partnerJourney.title",
        },
        {
          href: "/commercial/roi-analysis",
          labelKey: "commercialMegaMenu.commercial.items.roiAnalysis.title",
        },
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
              aria-label={t("commercialHeader.logoAria", { brand: BRAND.namePascal })}
            >
              <img
                src="/app-logo.png"
                alt={BRAND.namePascal}
                style={{ width: 24, height: 24, objectFit: "contain" }}
              />
              <span>{BRAND.nameUpper}</span>
            </Link>
            <p className="com-footer-tagline">{t("commercialFooter.tagline")}</p>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.titleKey}>
              <h4 className="com-footer-col-title">{t(col.titleKey)}</h4>
              <ul className="com-footer-links" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="com-footer-link">
                      {t(link.labelKey)}
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
            {t("commercialFooter.copyright", {
              year: new Date().getFullYear(),
              brand: BRAND.nameUpper,
            })}
          </p>
          <div className="com-footer-bottom-links">
            <Link href="/privacy">{t("commercialFooter.privacy")}</Link>
            <Link href="/terms">{t("commercialFooter.terms")}</Link>
            <Link href="/docs">{t("commercialFooter.developerDocs")}</Link>
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
  const { t, direction, loadSection } = useDocsI18n();
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
            <h1>{t("commercialNotFound.title")}</h1>
            <p>
              {t("commercialNotFound.message", { slug: slug.replace("commercial/", "") })}
            </p>
            <Link
              href="/commercial"
              className="com-btn com-btn--ghost"
              style={{ marginTop: "1rem" }}
            >
              {t("commercialNotFound.backHome")}
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
