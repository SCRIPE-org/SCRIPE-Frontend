"use client";

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

// ─── Content Registration ─────────────────────────────────────
// Import all content files so they self-register
import "../../data/content/registry";

interface DocsPageViewProps {
  slug: string;
}

/**
 * DocsPageView — Pure UI composition for a documentation page.
 * DocsLayout (i18n + theme providers) is in (docs)/layout.tsx.
 * This view is a pure SOLID View with zero providers.
 */
export function DocsPageView({ slug }: DocsPageViewProps) {
  const { t, direction } = useDocsI18n();
  const vm = useDocsViewModel(slug);
  const sidebar = useSidebarViewModel();
  const search = useSearchViewModel(vm.search);
  const toc = useTocViewModel(vm.headingIds);

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
      />
    </div>
  );
}
