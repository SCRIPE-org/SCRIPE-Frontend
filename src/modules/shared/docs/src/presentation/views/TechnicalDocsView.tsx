"use client";

import { useEffect, useState } from "react";
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

  // Reader states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fontSize, setFontSize] = useState<14 | 16 | 18>(16);
  const [wideLayout, setWideLayout] = useState(false);

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

      <div className={`docs-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <DocsSidebar categories={vm.categories} activeSlug={slug} />

        <div className="docs-content-wrapper">
          <main
            className="docs-content transition-all duration-200"
            style={{
              fontSize: `${fontSize}px`,
              maxWidth: wideLayout ? "1200px" : "800px",
            }}
          >
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <DocsBreadcrumb
                slug={slug}
                categoryTitleKey={vm.categoryInfo.titleKey}
                pageTitleKey={page.titleKey}
              />

              {/* Reader Toolbar */}
              <div className="reader-toolbar flex select-none items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-1.5 text-sm">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`reader-toolbar-btn rounded p-1 text-muted-foreground transition-colors hover:text-foreground ${sidebarCollapsed ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  aria-label="Toggle Sidebar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                  </svg>
                </button>

                <div className="reader-toolbar-divider mx-1 h-4 w-px bg-border/60" />

                <button
                  onClick={() => setFontSize(14)}
                  className={`reader-toolbar-btn rounded px-2 py-0.5 transition-colors ${fontSize === 14 ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title="Small Font Size"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(16)}
                  className={`reader-toolbar-btn rounded px-2 py-0.5 transition-colors ${fontSize === 16 ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title="Medium Font Size"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize(18)}
                  className={`reader-toolbar-btn rounded px-2 py-0.5 transition-colors ${fontSize === 18 ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title="Large Font Size"
                >
                  A+
                </button>

                <div className="reader-toolbar-divider mx-1 h-4 w-px bg-border/60" />

                <button
                  onClick={() => setWideLayout(!wideLayout)}
                  className={`reader-toolbar-btn rounded px-2 py-0.5 transition-colors ${wideLayout ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title="Toggle Wide Layout"
                >
                  {wideLayout ? "Compact" : "Wide"}
                </button>
              </div>
            </div>

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
