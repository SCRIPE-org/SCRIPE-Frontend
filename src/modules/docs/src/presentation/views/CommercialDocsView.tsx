"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDocsViewModel } from "../viewmodels/useDocsViewModel";
import { useSidebarViewModel } from "../viewmodels/useSidebarViewModel";
import { useSearchViewModel } from "../viewmodels/useSearchViewModel";
import { useDocsI18n } from "../providers/DocsI18nProvider";

// Commercial layout components
import { CommercialHeader } from "../components/layout/CommercialHeader";
import { CommercialSubNav } from "../components/layout/CommercialSubNav";
import { CommercialContent } from "../components/content/CommercialContent";
import { DocContent } from "../components/content/DocContent";

// Shared components
import { DocsPrevNext } from "../components/layout/DocsPrevNext";
import { DocsMobileNav } from "../components/layout/DocsMobileNav";
import { ReadingProgress } from "../components/ui/ReadingProgress";
import { DocsSearch } from "../components/ui/DocsSearch";

// ─── Props ────────────────────────────────────────────────────────
interface CommercialDocsViewProps {
  slug: string;
}

// ─── Footer Component ─────────────────────────────────────────────
function CommercialFooter() {
  const { t } = useDocsI18n();

  const footerLinks = [
    {
      titleKey: "nav.commercialWhyScripe",
      links: [
        { href: "/commercial/why-scripe-overview", labelKey: "commercial.whyScripeOverview.title" },
        { href: "/commercial/business-client-journeys", labelKey: "commercial.businessClientJourneys.title" },
        { href: "/commercial/marketplace-showcase", labelKey: "commercial.marketplaceShowcase.title" },
        { href: "/commercial/workspace-tours", labelKey: "commercial.workspaceTours.title" },
      ],
    },
    {
      titleKey: "nav.commercialEnterprise",
      links: [
        { href: "/commercial/white-labeling", labelKey: "commercial.whiteLabeling.title" },
        { href: "/commercial/tenant-isolation", labelKey: "commercial.tenantIsolation.title" },
        { href: "/commercial/sla-guarantees", labelKey: "commercial.slaGuarantees.title" },
        { href: "/commercial/multi-tenancy", labelKey: "commercial.multiTenancy.title" },
      ],
    },
    {
      titleKey: "nav.commercialPricing",
      links: [
        { href: "/commercial/pricing-showcase", labelKey: "commercial.pricingShowcase.title" },
        { href: "/commercial/licensing-model", labelKey: "commercial.licensingModel.title" },
        { href: "/commercial/support-plans", labelKey: "commercial.supportPlans.title" },
      ],
    },
    {
      titleKey: "nav.commercialSupport",
      links: [
        { href: "/commercial/investor-overview", labelKey: "commercial.investorOverview.title" },
        { href: "/commercial/partner-journey", labelKey: "commercial.partnerJourney.title" },
        { href: "/commercial/co-founder-journey", labelKey: "commercial.coFounderJourney.title" },
      ],
    },
  ];

  return (
    <footer className="com-footer">
      <div className="com-footer-inner">
        <div className="com-footer-grid">
          <div className="com-footer-brand-col">
            <Link href="/commercial/why-scripe-overview" className="com-footer-logo">
              <img
                src="/app-logo.png"
                alt="SCRIPE"
                width={28}
                height={28}
                className="object-contain inline-block mr-2"
                style={{ width: "28px", height: "28px" }}
              />
              <span className="com-footer-logo-text">SCRIPE</span>
            </Link>
            <p className="com-footer-tagline">
              Enterprise-grade modular monolith platform for B2B2C SaaS.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.titleKey} className="com-footer-col">
              <h4 className="com-footer-title">{t(group.titleKey)}</h4>
              <ul className="com-footer-list">
                {group.links.map((link) => (
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
        <div className="com-footer-bottom">
          <p className="com-footer-copyright">
            &copy; {new Date().getFullYear()} SCRIPE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── View ─────────────────────────────────────────────────────────
/**
 * Presentation UI component rendering the commercial docs view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
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

  // ── 404 ──────────────────────────────────────────────────────────
  if (vm.isNotFound) {
    return (
      <div className="commercial-root" dir={direction}>
        <CommercialHeader
          onSearchOpen={search.openSearch}
          onMobileMenuOpen={sidebar.openMobileMenu}
        />
        <div className="commercial-wrapper commercial-wrapper--full-width">
          <div className="commercial-main commercial-main--full-width">
            <div className="commercial-404">
              <h1>404</h1>
              <p>Page not found: /commercial/{slug.replace("commercial/", "")}</p>
            </div>
          </div>
        </div>
        <CommercialFooter />
      </div>
    );
  }

  const page = vm.page!;

  // ── Premium Landing Layout ────────────────────────────────────────
  if (page.layout === "landing") {
    return (
      <div className="commercial-root" dir={direction}>
        <CommercialHeader
          onSearchOpen={search.openSearch}
          onMobileMenuOpen={sidebar.openMobileMenu}
        />
        <CommercialSubNav
          categories={vm.categories}
          activeSlug={slug}
          pageTitleKey={page.titleKey}
          categoryInfo={vm.categoryInfo}
        />
        <div className="com-landing">
          <DocContent sections={page.sections} />
        </div>
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

  // ── Main layout ──────────────────────────────────────────────────
  return (
    <div className="commercial-root" dir={direction}>
      <ReadingProgress />
      <CommercialHeader
        onSearchOpen={search.openSearch}
        onMobileMenuOpen={sidebar.openMobileMenu}
      />
      <CommercialSubNav
        categories={vm.categories}
        activeSlug={slug}
        pageTitleKey={page.titleKey}
        categoryInfo={vm.categoryInfo}
      />

      <div className="commercial-wrapper commercial-wrapper--full-width">
        <div className="commercial-main commercial-main--full-width">
          <CommercialContent
            sections={page.sections}
            titleKey={page.titleKey}
            descriptionKey={page.descriptionKey}
            lastUpdated={page.lastUpdated}
          />

          <DocsPrevNext
            prevSlug={vm.prevSlug}
            prevTitleKey={vm.prevTitleKey}
            nextSlug={vm.nextSlug}
            nextTitleKey={vm.nextTitleKey}
            basePath="/commercial"
          />
        </div>
      </div>

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
