"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@core/ui/button";
import { FileQuestion } from "lucide-react";
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
import { EmptyState } from "@core/ui/empty-state";

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
            <div className="docs-content flex min-h-[50vh] items-center justify-center">
              <EmptyState
                size="lg"
                icon={FileQuestion}
                title={t("common.notFoundTitle")}
                description={t("common.notFoundDescription", { slug })}
                action={
                  <Button asChild>
                    <Link href="/docs" prefetch={false}>
                      {t("common.home")}
                    </Link>
                  </Button>
                }
              />
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
            className="docs-content transition-[font-size,max-width] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
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
              <div className="reader-toolbar flex select-none items-center gap-2 rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-line)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-raised)_40%,transparent)] px-3 py-1.5 text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`reader-toolbar-btn h-auto rounded-nx-sm p-1 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink motion-reduce:transition-none ${sidebarCollapsed ? "bg-nx-accent-wash text-nx-accent" : "hover:bg-nx-hover"}`}
                  title={sidebarCollapsed ? t("common.expandSidebar") : t("common.collapseSidebar")}
                  aria-label={
                    sidebarCollapsed ? t("common.expandSidebar") : t("common.collapseSidebar")
                  }
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
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                  </svg>
                </Button>

                <div className="reader-toolbar-divider mx-1 h-4 w-px bg-[color:color-mix(in_srgb,var(--nx-line)_60%,transparent)]" />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFontSize(14)}
                  className={`reader-toolbar-btn h-auto rounded-nx-sm px-2 py-0.5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${fontSize === 14 ? "bg-nx-accent-fill font-bold text-nx-on-fill" : "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"}`}
                  title={t("common.fontSizeSmall")}
                  aria-label={t("common.fontSizeSmall")}
                >
                  A-
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFontSize(16)}
                  className={`reader-toolbar-btn h-auto rounded-nx-sm px-2 py-0.5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${fontSize === 16 ? "bg-nx-accent-fill font-bold text-nx-on-fill" : "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"}`}
                  title={t("common.fontSizeMedium")}
                  aria-label={t("common.fontSizeMedium")}
                >
                  A
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFontSize(18)}
                  className={`reader-toolbar-btn h-auto rounded-nx-sm px-2 py-0.5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${fontSize === 18 ? "bg-nx-accent-fill font-bold text-nx-on-fill" : "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"}`}
                  title={t("common.fontSizeLarge")}
                  aria-label={t("common.fontSizeLarge")}
                >
                  A+
                </Button>

                <div className="reader-toolbar-divider mx-1 h-4 w-px bg-[color:color-mix(in_srgb,var(--nx-line)_60%,transparent)]" />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setWideLayout(!wideLayout)}
                  className={`reader-toolbar-btn h-auto rounded-nx-sm px-2 py-0.5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${wideLayout ? "bg-nx-accent-fill font-bold text-nx-on-fill" : "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"}`}
                  title={
                    wideLayout ? t("common.switchToCompactLayout") : t("common.switchToWideLayout")
                  }
                  aria-label={
                    wideLayout ? t("common.switchToCompactLayout") : t("common.switchToWideLayout")
                  }
                >
                  {wideLayout ? t("common.layoutCompact") : t("common.layoutWide")}
                </Button>
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
