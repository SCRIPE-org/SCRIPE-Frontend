// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import Link from "next/link";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DocCategory, DocNavItem } from "../../../domain/entities/DocCategory";
import { useState, useCallback } from "react";
import {
  Rocket,
  BookOpen,
  Layout,
  Star,
  Monitor,
  Shield,
  Code,
  Server,
  Briefcase,
  Layers,
  Building,
  Cpu,
  Link as LinkIcon,
  Globe,
  Zap,
  Users,
  BarChart,
  Book,
  Database,
  Boxes,
  HardDrive,
  GitBranch,
  Terminal,
  Package,
  KeyRound,
  Scale,
  ChevronRight,
  type LucideProps,
} from "lucide-react";

// ─── Icons ──────────────────────────────────────────────────────
// One lucide-backed map for every docs sidebar surface. This used to be a
// 690-line hand-cut SVG file (DocsIcons.tsx) duplicated key-for-key in this
// component — two copies of the same 26 icons, both re-drawing paths that
// lucide-react (an already-declared dependency) already ships. Exported
// (not module-local) because CommercialSidebar and DocsMobileNav render the
// identical nav-icon set and import this map by name.
export const docsIcons: Record<string, (props: LucideProps) => React.ReactNode> = {
  rocket: (props) => <Rocket aria-hidden="true" {...props} />,
  "book-open": (props) => <BookOpen aria-hidden="true" {...props} />,
  layout: (props) => <Layout aria-hidden="true" {...props} />,
  star: (props) => <Star aria-hidden="true" {...props} />,
  monitor: (props) => <Monitor aria-hidden="true" {...props} />,
  shield: (props) => <Shield aria-hidden="true" {...props} />,
  code: (props) => <Code aria-hidden="true" {...props} />,
  server: (props) => <Server aria-hidden="true" {...props} />,
  briefcase: (props) => <Briefcase aria-hidden="true" {...props} />,
  layers: (props) => <Layers aria-hidden="true" {...props} />,
  building: (props) => <Building aria-hidden="true" {...props} />,
  cpu: (props) => <Cpu aria-hidden="true" {...props} />,
  link: (props) => <LinkIcon aria-hidden="true" {...props} />,
  globe: (props) => <Globe aria-hidden="true" {...props} />,
  zap: (props) => <Zap aria-hidden="true" {...props} />,
  users: (props) => <Users aria-hidden="true" {...props} />,
  "bar-chart": (props) => <BarChart aria-hidden="true" {...props} />,
  book: (props) => <Book aria-hidden="true" {...props} />,
  database: (props) => <Database aria-hidden="true" {...props} />,
  boxes: (props) => <Boxes aria-hidden="true" {...props} />,
  "hard-drive": (props) => <HardDrive aria-hidden="true" {...props} />,
  "git-branch": (props) => <GitBranch aria-hidden="true" {...props} />,
  terminal: (props) => <Terminal aria-hidden="true" {...props} />,
  package: (props) => <Package aria-hidden="true" {...props} />,
  key: (props) => <KeyRound aria-hidden="true" {...props} />,
  scale: (props) => <Scale aria-hidden="true" {...props} />,
};

// ─── Helper: count total visible leaf items (recursive) ──────
function countLeafItems(items: DocNavItem[]): number {
  let count = 0;
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      count += 1; // sub-group header itself
      count += item.children.length;
    } else {
      count += 1;
    }
  }
  return count;
}

interface DocsSidebarProps {
  categories: DocCategory[];
  activeSlug: string;
}

/**
 * Presentation UI component rendering the docs sidebar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DocsSidebar({ categories, activeSlug }: DocsSidebarProps) {
  const { t } = useDocsI18n();

  // Track which categories are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      const hasActive = cat.getAllSlugs().includes(activeSlug);
      initial[cat.id] = hasActive;
    }
    return initial;
  });

  // Track which sub-groups are expanded
  const [subExpanded, setSubExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      for (const item of cat.items) {
        if (item.children) {
          const childSlugs = item.children.map((c) => c.slug).filter(Boolean);
          const hasActive = childSlugs.includes(activeSlug);
          initial[item.id] = hasActive;
        }
      }
    }
    return initial;
  });

  // Auto-expand the category and sub-group containing the active slug
  const [prevActiveSlug, setPrevActiveSlug] = useState(activeSlug);
  if (activeSlug !== prevActiveSlug) {
    setPrevActiveSlug(activeSlug);
    setExpanded((prev) => {
      const next = { ...prev };
      for (const cat of categories) {
        if (cat.getAllSlugs().includes(activeSlug)) {
          next[cat.id] = true;
        }
      }
      return next;
    });
    setSubExpanded((prev) => {
      const next = { ...prev };
      for (const cat of categories) {
        for (const item of cat.items) {
          if (item.children) {
            const childSlugs = item.children.map((c) => c.slug).filter(Boolean);
            if (childSlugs.includes(activeSlug)) {
              next[item.id] = true;
            }
          }
        }
      }
      return next;
    });
  }

  const toggleCategory = useCallback((catId: string) => {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }, []);

  const toggleSubGroup = useCallback((subId: string) => {
    setSubExpanded((prev) => ({ ...prev, [subId]: !prev[subId] }));
  }, []);

  const renderItem = (item: DocNavItem) => {
    // ─── Sub-group with children ─────────────────────────────
    if (item.children && item.children.length > 0) {
      const isSubOpen = subExpanded[item.id] ?? false;
      return (
        <div key={item.id} className="docs-sidebar-subgroup">
          <button
            className="docs-sidebar-subgroup-btn"
            onClick={() => toggleSubGroup(item.id)}
            data-expanded={isSubOpen}
          >
            {item.icon ? (docsIcons[item.icon]?.({ size: 16 }) ?? null) : null}
            <span style={{ flex: 1 }}>{t(item.titleKey)}</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
          <div
            className="docs-sidebar-subgroup-items"
            style={{
              maxHeight: isSubOpen ? `${item.children.length * 36}px` : "0px",
            }}
          >
            {item.children.map((child) => {
              if (!child.slug) return null;
              const isActive = child.slug === activeSlug;
              return (
                <Link
                  key={child.id}
                  href={`/docs/${child.slug}`}
                  className="docs-sidebar-item docs-sidebar-item--nested"
                  data-active={isActive}
                >
                  {t(child.titleKey)}
                </Link>
              );
            })}
          </div>
        </div>
      );
    }

    // ─── Regular leaf item ────────────────────────────────────
    if (!item.slug) return null;
    const isActive = item.slug === activeSlug;

    return (
      <Link
        key={item.id}
        href={`/docs/${item.slug}`}
        className="docs-sidebar-item"
        data-active={isActive}
      >
        {t(item.titleKey)}
      </Link>
    );
  };

  return (
    <aside className="docs-sidebar">
      {categories.map((cat) => {
        const totalItems = countLeafItems(cat.items);
        return (
          <div key={cat.id} className="docs-sidebar-category">
            <button
              className="docs-sidebar-category-btn"
              onClick={() => toggleCategory(cat.id)}
              data-expanded={expanded[cat.id]}
            >
              {docsIcons[cat.icon]?.({ size: 16 }) ?? null}
              <span style={{ flex: 1 }}>{t(cat.titleKey)}</span>
              <ChevronRight size={14} aria-hidden="true" />
            </button>

            <div
              className="docs-sidebar-items"
              style={{
                maxHeight: expanded[cat.id] ? `${totalItems * 36 + 100}px` : "0px",
              }}
            >
              {cat.items.map(renderItem)}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
