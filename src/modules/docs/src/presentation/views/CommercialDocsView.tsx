"use client";

import { useEffect } from "react";
import { useDocsViewModel } from "../viewmodels/useDocsViewModel";
import { useSidebarViewModel } from "../viewmodels/useSidebarViewModel";
import { useSearchViewModel } from "../viewmodels/useSearchViewModel";
import { useTocViewModel } from "../viewmodels/useTocViewModel";
import { useDocsI18n } from "../providers/DocsI18nProvider";

// Commercial layout components
import { CommercialHeader } from "../components/layout/CommercialHeader";
import { CommercialSidebar } from "../components/layout/CommercialSidebar";
import { CommercialContent } from "../components/content/CommercialContent";

// Shared components
import { DocsPrevNext } from "../components/layout/DocsPrevNext";
import { DocsMobileNav } from "../components/layout/DocsMobileNav";
import { DocsToc } from "../components/layout/DocsToc";
import { ReadingProgress } from "../components/ui/ReadingProgress";
import { DocsSearch } from "../components/ui/DocsSearch";
import { CommercialHomeLanding } from "./CommercialHomeLanding";
import { InvestorLandingView } from "./InvestorLandingView";

// ─── Props ────────────────────────────────────────────────────────
interface CommercialDocsViewProps {
  slug: string;
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
  const toc = useTocViewModel(vm.headingIds);

  // Lazy-load the section locale for the current commercial page
  useEffect(() => {
    loadSection(slug);
  }, [slug, loadSection]);

  // ── Full-screen marketing landing for the home/overview page ─────
  if (slug === "commercial/why-scripe-overview") {
    return (
      <div className="commercial-root" dir={direction}>
        <CommercialHeader
          onSearchOpen={search.openSearch}
          onMobileMenuOpen={sidebar.openMobileMenu}
        />
        <CommercialHomeLanding />
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

  // ── Full-screen custom view for investor overview page ────────────
  if (slug === "commercial/investor-overview") {
    return (
      <div className="commercial-root" dir={direction}>
        <CommercialHeader
          onSearchOpen={search.openSearch}
          onMobileMenuOpen={sidebar.openMobileMenu}
        />
        <InvestorLandingView />
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

  // ── 404 ──────────────────────────────────────────────────────────
  if (vm.isNotFound) {
    return (
      <div className="commercial-root" dir={direction}>
        <CommercialHeader
          onSearchOpen={search.openSearch}
          onMobileMenuOpen={sidebar.openMobileMenu}
        />
        <div className="commercial-wrapper">
          <CommercialSidebar categories={vm.categories} activeSlug={slug} />
          <div className="commercial-main">
            <div className="commercial-404">
              <h1>404</h1>
              <p>Page not found: /commercial/{slug.replace("commercial/", "")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const page = vm.page!;

  // ── Main layout ──────────────────────────────────────────────────
  return (
    <div className="commercial-root" dir={direction}>
      <ReadingProgress />
      <CommercialHeader
        onSearchOpen={search.openSearch}
        onMobileMenuOpen={sidebar.openMobileMenu}
      />

      <div className="commercial-wrapper">
        <CommercialSidebar categories={vm.categories} activeSlug={slug} />

        <div className="commercial-content-wrapper">
          <div className="commercial-main">
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

          <DocsToc headings={vm.headings} activeId={toc.activeId} />
        </div>
      </div>

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
