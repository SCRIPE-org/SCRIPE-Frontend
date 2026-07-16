import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "frontend.componentLibrary.intro" },

  // ─── shadcn/ui Foundation ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.componentLibrary.shadcnTitle",
    id: "shadcn-foundation",
  },
  { type: "paragraph", contentKey: "frontend.componentLibrary.shadcnIntro" },
  {
    type: "table",
    headers: ["Category", "Components", "Location"],
    rows: [
      ["Form Inputs", "Input, Textarea, Select, Checkbox, Switch, Radio, Slider", "@core/ui/"],
      ["Layout", "Card, Separator, Tabs, Accordion, Sheet, ScrollArea", "@core/ui/"],
      ["Feedback", "Alert, Toast, Badge, Progress, Skeleton", "@core/ui/"],
      ["Overlay", "Dialog, Popover, Tooltip, DropdownMenu, ContextMenu", "@core/ui/"],
      ["Navigation", "Breadcrumb, Pagination, Command, NavigationMenu", "@core/ui/"],
      ["Data Display", "Table, Avatar, Calendar", "@core/ui/"],
      ["Custom", "GenericSelect, ColorPicker, FilePicker, DateRangePicker", "@core/ui/ (extended)"],
    ],
  },

  // ─── Component Architecture ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.componentLibrary.architectureTitle",
    id: "architecture",
  },
  {
    type: "code",
    language: "typescript",
    filename: "Component Architecture Pattern — cn() utility",
    code: `// @core/ui/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Exported function defining parameters and fields for cn configurations.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in any component:
<button className={cn(
  "px-4 py-2 rounded-md font-medium",
  variant === "primary" && "bg-primary text-white",
  variant === "secondary" && "bg-secondary text-secondary-foreground",
  disabled && "opacity-50 cursor-not-allowed",
  className  // Allow consumer overrides
)} />`,
  },

  // ─── GenericSelect ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.componentLibrary.genericSelectTitle",
    id: "generic-select",
  },
  { type: "paragraph", contentKey: "frontend.componentLibrary.genericSelectIntro" },
  {
    type: "code",
    language: "tsx",
    filename: "GenericSelect — Usage Examples",
    code: `// Simple flat select
<GenericSelect
  options={roles}
  value={selectedRoleId}
  onChange={setSelectedRoleId}
  getLabel={(r) => r.name}
  getValue={(r) => r.id}
  placeholder={t("selectRole")}
  searchable
/>

// Hierarchical tree select (tenants)
<GenericSelect
  options={tenants}
  value={selectedTenantId}
  onChange={setSelectedTenantId}
  getLabel={(t) => t.name}
  getValue={(t) => t.id}
  getChildren={(t) => t.children}
  getParentId={(t) => t.parentTenantId}
  mode="tree"
  searchable
  placeholder={t("selectTenant")}
/>

// Multi-select (permissions)
<GenericSelect
  options={permissions}
  value={selectedPermIds}
  onChange={setSelectedPermIds}
  getLabel={(p) => p.name}
  getValue={(p) => p.id}
  getGroup={(p) => p.category}
  mode="multi"
  searchable
/>`,
  },

  // ─── Theme System ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.componentLibrary.themeTitle",
    id: "theme-system",
  },
  {
    type: "code",
    language: "typescript",
    filename: "brand.ts — Aurora Refined Brand Design Tokens",
    code: `export const BRAND_TOKENS = {
  bg: {
    base: "#06060E",
    panel: "rgba(20,12,46,0.78)",
    card: "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
    glass: "rgba(6,6,14,0.85)",
  },
  gradient: {
    cta: "linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)",
    page: "radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%, #04040A 100%)",
  },
  palette: {
    violet: "#A855F7",
    violetDark: "#7C3AED",
    indigo: "#6366F1",
    cyan: "#22D3EE",
  }
};

export const DARK_THEME = {
  surface: "#06060E",
  surfaceRaised: "rgba(20,12,46,0.78)",
  borderCard: "1px solid rgba(168,85,247,0.22)",
  gradientPage: "radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%, #04040A 100%)",
  gradientCta: "linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)",
  shadowCard: "0 25px 50px -12px rgba(0,0,0,.5), 0 0 80px -20px rgba(168,85,247,.15)"
};

export const LIGHT_THEME = {
  surface: "#F8F7FF",
  surfaceRaised: "#FFFFFF",
  borderCard: "1px solid rgba(168,85,247,0.18)",
  gradientPage: "radial-gradient(140% 90% at 25% 25%, #EDE9FE 0%, #F5F3FF 40%, #F8F7FF 80%, #FAFAFE 100%)",
  gradientCta: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4F46E5 100%)",
  shadowCard: "0 4px 24px -4px rgba(124,58,237,0.12), 0 1px 3px rgba(0,0,0,0.06)"
};`,
  },
  {
    type: "code",
    language: "typescript",
    filename: "dom-applicator.ts — Custom Settings Root DOM Sync",
    code: `export function applySettingsToDOM(settings: Settings): void {
  if (typeof document === "undefined") return;

  requestAnimationFrame(() => {
    const root = document.documentElement;

    // Flush settings as data-attributes (e.g. data-theme="blue", data-button-style="modern")
    for (const [key, attr] of Object.entries(DATA_ATTR_MAP)) {
      const value = settings[key as keyof Settings];
      root.setAttribute(attr, typeof value === "boolean" ? value.toString() : String(value));
    }

    // Set computed HSL/measure values
    root.style.setProperty("--font-size-base", FONT_SIZE_MAP[settings.fontSize] || "18px");
    root.style.setProperty("--spacing-unit", SPACING_MAP[settings.spacingSize] || "1rem");
    root.style.setProperty("--border-radius", BORDER_RADIUS_MAP[settings.borderRadius] || "0.5rem");
  });
}`,
  },
  {
    type: "code",
    language: "css",
    filename: "globals.css & tailwind.config.js Bindings",
    code: `/* Binds dynamic HSL parameters for compile-time compilation */
:root {
  --background: 0 0% 100%;
  --primary: 262 83% 58%;
  --border: 240 5.9% 90%;
}
.dark {
  --background: 240 10% 3.9%;
  --primary: 262 83% 58%;
}

/* Tailwind maps class styles directly to HSL variables */
colors: {
  background: "hsl(var(--background))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))"
  }
}`,
  },

  // ─── Component Categories ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.componentLibrary.categoriesTitle",
    id: "categories",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "📝",
        titleKey: "frontend.componentLibrary.formsTitle",
        descriptionKey: "frontend.componentLibrary.formsDesc",
      },
      {
        icon: "📊",
        titleKey: "frontend.componentLibrary.chartsTitle",
        descriptionKey: "frontend.componentLibrary.chartsDesc",
      },
      {
        icon: "🎨",
        titleKey: "frontend.componentLibrary.layoutTitle",
        descriptionKey: "frontend.componentLibrary.layoutDesc",
      },
      {
        icon: "🔔",
        titleKey: "frontend.componentLibrary.feedbackTitle",
        descriptionKey: "frontend.componentLibrary.feedbackDesc",
      },
      {
        icon: "📱",
        titleKey: "frontend.componentLibrary.responsiveTitle",
        descriptionKey: "frontend.componentLibrary.responsiveDesc",
      },
      {
        icon: "♿",
        titleKey: "frontend.componentLibrary.a11yTitle",
        descriptionKey: "frontend.componentLibrary.a11yDesc",
      },
    ],
  },

  // ─── Placement Rules ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.componentLibrary.placementTitle",
    id: "placement",
  },
  {
    type: "table",
    headers: ["Location", "Purpose", "Examples"],
    rows: [
      ["@core/ui/", "Shared, generic, reusable across all modules", "Button, Input, Dialog, Toast"],
      [
        "@core/ui/ (extended)",
        "Generic but complex; module-agnostic",
        "GenericSelect, DataTable, FormDialog",
      ],
      [
        "@modules/{name}/components/",
        "Domain-specific, only this module uses",
        "AdminCard, TenantBadge, RolePicker",
      ],
      [
        "src/app/{route}/",
        "Route-specific tiny client fragments only",
        "DarkModeToggle (extracted for SSR)",
      ],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "frontend.componentLibrary.neverInApp",
  },
];

registerPage({
  slug: "frontend/component-library",
  titleKey: "frontend.componentLibrary.title",
  descriptionKey: "frontend.componentLibrary.description",
  category: "frontend",
  order: 6,
  sections,
  relatedSlugs: ["frontend/crud-system", "frontend/localization", "architecture/frontend"],
  lastUpdated: "2026-02-20",
});
