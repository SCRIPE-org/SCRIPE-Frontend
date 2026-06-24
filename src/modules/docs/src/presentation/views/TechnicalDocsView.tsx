"use client";

import { useEffect } from "react";
import { useDocsViewModel } from "../viewmodels/useDocsViewModel";
import { useSidebarViewModel } from "../viewmodels/useSidebarViewModel";
import { useSearchViewModel } from "../viewmodels/useSearchViewModel";
import { useTocViewModel } from "../viewmodels/useTocViewModel";
import { useDocsI18n } from "../providers/DocsI18nProvider";

// Layout components
import { DocsHeader } from "../components/layout/DocsHeader";
import { DocsSidebar } from "../components/layout/DocsSidebar";
import { DocsBreadcrumb } from "../components/layout/DocsBreadcrumb";
import { DocsToc } from "../components/layout/DocsToc";
import { DocsPrevNext } from "../components/layout/DocsPrevNext";
import { DocsMobileNav } from "../components/layout/DocsMobileNav";

// Content
import { DocContent } from "../components/content/DocContent";

// UI
import { ReadingProgress } from "../components/ui/ReadingProgress";
import { DocsSearch } from "../components/ui/DocsSearch";

// ─── Props ────────────────────────────────────────────────────────
interface TechnicalDocsViewProps {
  slug: string;
}

// ─── View ─────────────────────────────────────────────────────────
/**
 * Presentation UI component rendering the technical docs view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TechnicalDocsView({ slug }: TechnicalDocsViewProps) {
  const { t, direction, loadSection } = useDocsI18n();
  const vm = useDocsViewModel(slug, "technical");
  const sidebar = useSidebarViewModel();
  const search = useSearchViewModel(vm.search);
  const toc = useTocViewModel(vm.headingIds);

  // Lazy-load the section locale for the current page
  useEffect(() => {
    loadSection(slug);
  }, [slug, loadSection]);

  if (vm.isNotFound) {
    return (
      <div className="docs-root" dir={direction}>
        <DocsHeader onSearchOpen={search.openSearch} onMobileMenuOpen={sidebar.openMobileMenu} />
        <div className="docs-wrapper">
          <DocsSidebar categories={vm.categories} activeSlug={slug} />
          <div className="docs-content-wrapper">
            <div
              className="docs-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                minHeight: "50vh",
              }}
            >
              <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>404</h1>
              <p style={{ color: "hsl(var(--muted-foreground))" }}>Page not found: /docs/{slug}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const page = vm.page!;

  return (
    <div className="docs-root" dir={direction}>
      <ReadingProgress />
      <DocsHeader onSearchOpen={search.openSearch} onMobileMenuOpen={sidebar.openMobileMenu} />

      <div className="docs-wrapper">
        <DocsSidebar categories={vm.categories} activeSlug={slug} />

        <div className="docs-content-wrapper">
          <main className="docs-content">
            <DocsBreadcrumb
              slug={slug}
              categoryTitleKey={vm.categoryInfo.titleKey}
              pageTitleKey={page.titleKey}
            />

            <h1 className="docs-page-title">{t(page.titleKey)}</h1>
            {page.descriptionKey && (
              <p className="docs-page-description">{t(page.descriptionKey)}</p>
            )}

            <DocContent sections={page.sections} />

            <DocsPrevNext
              prevSlug={vm.prevSlug}
              prevTitleKey={vm.prevTitleKey}
              nextSlug={vm.nextSlug}
              nextTitleKey={vm.nextTitleKey}
              basePath="/docs"
            />
          </main>

          <DocsToc headings={vm.headings} activeId={toc.activeId} />
        </div>
      </div>

      {/* Overlays */}
      <DocsSearch
        isOpen={search.isSearchOpen}
        onClose={search.closeSearch}
        onSearch={search.searchFn}
      />

      <DocsMobileNav
        categories={vm.categories}
        activeSlug={slug}
        isOpen={sidebar.isMobileMenuOpen}
        onClose={sidebar.closeMobileMenu}
        basePath="/docs"
      />
    </div>
  );
}
