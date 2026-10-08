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
  Building2,
  Cpu,
  Link as LinkIcon,
  Globe,
  Zap,
  Users,
  Users2,
  UserCheck,
  BarChart,
  PieChart,
  TrendingUp,
  Book,
  Database,
  Boxes,
  HardDrive,
  GitBranch,
  GitMerge,
  Terminal,
  Package,
  KeyRound,
  Scale,
  Calendar,
  DollarSign,
  CreditCard,
  Award,
  FileText,
  PhoneCall,
  Folder,
  FolderTree,
  Mail,
  Radio,
  FileCode,
  UploadCloud,
  CheckSquare,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Clock,
  Lock,
  Settings,
  Sliders,
  RotateCcw,
  HelpCircle,
  Compass,
  FileCheck,
  Percent,
  Tag,
  MapPin,
  Bell,
  LayoutGrid,
  Puzzle,
  Rss,
  ShoppingBag,
  Trash2,
  Image as ImageIcon,
  Info,
  CheckCircle2,
  Sparkles,
  Palette,
  Workflow,
  FileQuestion,
  Share2,
  ChevronRight,
  type LucideProps,
} from "lucide-react";

// ─── Icons ──────────────────────────────────────────────────────
// One lucide-backed map for every docs sidebar surface.
/**
 * Documentation for module export
 */
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
  "building-2": (props) => <Building2 aria-hidden="true" {...props} />,
  cpu: (props) => <Cpu aria-hidden="true" {...props} />,
  link: (props) => <LinkIcon aria-hidden="true" {...props} />,
  globe: (props) => <Globe aria-hidden="true" {...props} />,
  zap: (props) => <Zap aria-hidden="true" {...props} />,
  users: (props) => <Users aria-hidden="true" {...props} />,
  "users-2": (props) => <Users2 aria-hidden="true" {...props} />,
  "user-check": (props) => <UserCheck aria-hidden="true" {...props} />,
  "bar-chart": (props) => <BarChart aria-hidden="true" {...props} />,
  "pie-chart": (props) => <PieChart aria-hidden="true" {...props} />,
  "trending-up": (props) => <TrendingUp aria-hidden="true" {...props} />,
  book: (props) => <Book aria-hidden="true" {...props} />,
  database: (props) => <Database aria-hidden="true" {...props} />,
  boxes: (props) => <Boxes aria-hidden="true" {...props} />,
  "hard-drive": (props) => <HardDrive aria-hidden="true" {...props} />,
  "git-branch": (props) => <GitBranch aria-hidden="true" {...props} />,
  "git-merge": (props) => <GitMerge aria-hidden="true" {...props} />,
  terminal: (props) => <Terminal aria-hidden="true" {...props} />,
  package: (props) => <Package aria-hidden="true" {...props} />,
  key: (props) => <KeyRound aria-hidden="true" {...props} />,
  scale: (props) => <Scale aria-hidden="true" {...props} />,
  calendar: (props) => <Calendar aria-hidden="true" {...props} />,
  "dollar-sign": (props) => <DollarSign aria-hidden="true" {...props} />,
  "credit-card": (props) => <CreditCard aria-hidden="true" {...props} />,
  award: (props) => <Award aria-hidden="true" {...props} />,
  "file-text": (props) => <FileText aria-hidden="true" {...props} />,
  "phone-call": (props) => <PhoneCall aria-hidden="true" {...props} />,
  folder: (props) => <Folder aria-hidden="true" {...props} />,
  "folder-tree": (props) => <FolderTree aria-hidden="true" {...props} />,
  mail: (props) => <Mail aria-hidden="true" {...props} />,
  radio: (props) => <Radio aria-hidden="true" {...props} />,
  "file-code": (props) => <FileCode aria-hidden="true" {...props} />,
  "upload-cloud": (props) => <UploadCloud aria-hidden="true" {...props} />,
  "check-square": (props) => <CheckSquare aria-hidden="true" {...props} />,
  "shield-check": (props) => <ShieldCheck aria-hidden="true" {...props} />,
  "shield-alert": (props) => <ShieldAlert aria-hidden="true" {...props} />,
  activity: (props) => <Activity aria-hidden="true" {...props} />,
  clock: (props) => <Clock aria-hidden="true" {...props} />,
  lock: (props) => <Lock aria-hidden="true" {...props} />,
  settings: (props) => <Settings aria-hidden="true" {...props} />,
  sliders: (props) => <Sliders aria-hidden="true" {...props} />,
  "rotate-ccw": (props) => <RotateCcw aria-hidden="true" {...props} />,
  "help-circle": (props) => <HelpCircle aria-hidden="true" {...props} />,
  compass: (props) => <Compass aria-hidden="true" {...props} />,
  "file-check": (props) => <FileCheck aria-hidden="true" {...props} />,
  percent: (props) => <Percent aria-hidden="true" {...props} />,
  tag: (props) => <Tag aria-hidden="true" {...props} />,
  "map-pin": (props) => <MapPin aria-hidden="true" {...props} />,
  bell: (props) => <Bell aria-hidden="true" {...props} />,
  "layout-grid": (props) => <LayoutGrid aria-hidden="true" {...props} />,
  puzzle: (props) => <Puzzle aria-hidden="true" {...props} />,
  rss: (props) => <Rss aria-hidden="true" {...props} />,
  "shopping-bag": (props) => <ShoppingBag aria-hidden="true" {...props} />,
  "trash-2": (props) => <Trash2 aria-hidden="true" {...props} />,
  image: (props) => <ImageIcon aria-hidden="true" {...props} />,
  info: (props) => <Info aria-hidden="true" {...props} />,
  "check-circle": (props) => <CheckCircle2 aria-hidden="true" {...props} />,
  sparkles: (props) => <Sparkles aria-hidden="true" {...props} />,
  palette: (props) => <Palette aria-hidden="true" {...props} />,
  workflow: (props) => <Workflow aria-hidden="true" {...props} />,
  "file-question": (props) => <FileQuestion aria-hidden="true" {...props} />,
  "share-2": (props) => <Share2 aria-hidden="true" {...props} />,
};

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
          <div className="docs-sidebar-subgroup-items" data-expanded={isSubOpen}>
            <div className="docs-sidebar-subgroup-items-inner">
              {item.children.map((child) => {
                if (!child.slug) return null;
                const isActive = child.slug === activeSlug;
                return (
                  <Link
                    key={child.id}
                    href={`/docs/${child.slug}`}
                    prefetch={false}
                    className="docs-sidebar-item docs-sidebar-item--nested"
                    data-active={isActive}
                  >
                    {child.icon ? (docsIcons[child.icon]?.({ size: 14, className: "docs-sidebar-item-icon" }) ?? null) : null}
                    <span>{t(child.titleKey)}</span>
                  </Link>
                );
              })}
            </div>
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
        prefetch={false}
        className="docs-sidebar-item"
        data-active={isActive}
      >
        {item.icon ? (docsIcons[item.icon]?.({ size: 15, className: "docs-sidebar-item-icon" }) ?? null) : null}
        <span>{t(item.titleKey)}</span>
      </Link>
    );
  };

  return (
    <aside className="docs-sidebar">
      {categories.map((cat) => {
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

            <div className="docs-sidebar-items" data-expanded={expanded[cat.id] ?? false}>
              <div className="docs-sidebar-items-inner">{cat.items.map(renderItem)}</div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
