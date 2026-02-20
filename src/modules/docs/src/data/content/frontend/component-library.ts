import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "frontend.componentLibrary.intro" },

      // ─── shadcn/ui Foundation ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.componentLibrary.shadcnTitle", id: "shadcn-foundation",
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
            type: "heading", level: 2,
            titleKey: "frontend.componentLibrary.architectureTitle", id: "architecture",
      },
      {
            type: "code",
            language: "typescript",
            filename: "Component Architecture Pattern — cn() utility",
            code: `// @core/ui/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
            type: "heading", level: 2,
            titleKey: "frontend.componentLibrary.genericSelectTitle", id: "generic-select",
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
            type: "heading", level: 2,
            titleKey: "frontend.componentLibrary.themeTitle", id: "theme-system",
      },
      {
            type: "code",
            language: "css",
            filename: "CSS Variables — Dark/Light Theme System",
            code: `:root {
  /* Light theme tokens */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --accent: 240 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --border: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --muted: 240 3.7% 15.9%;
  --border: 240 3.7% 15.9%;
}`,
      },

      // ─── Component Categories ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.componentLibrary.categoriesTitle", id: "categories",
      },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "📝", titleKey: "frontend.componentLibrary.formsTitle", descriptionKey: "frontend.componentLibrary.formsDesc" },
                  { icon: "📊", titleKey: "frontend.componentLibrary.chartsTitle", descriptionKey: "frontend.componentLibrary.chartsDesc" },
                  { icon: "🎨", titleKey: "frontend.componentLibrary.layoutTitle", descriptionKey: "frontend.componentLibrary.layoutDesc" },
                  { icon: "🔔", titleKey: "frontend.componentLibrary.feedbackTitle", descriptionKey: "frontend.componentLibrary.feedbackDesc" },
                  { icon: "📱", titleKey: "frontend.componentLibrary.responsiveTitle", descriptionKey: "frontend.componentLibrary.responsiveDesc" },
                  { icon: "♿", titleKey: "frontend.componentLibrary.a11yTitle", descriptionKey: "frontend.componentLibrary.a11yDesc" },
            ],
      },

      // ─── Placement Rules ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "frontend.componentLibrary.placementTitle", id: "placement",
      },
      {
            type: "table",
            headers: ["Location", "Purpose", "Examples"],
            rows: [
                  ["@core/ui/", "Shared, generic, reusable across all modules", "Button, Input, Dialog, Toast"],
                  ["@core/ui/ (extended)", "Generic but complex; module-agnostic", "GenericSelect, DataTable, FormDialog"],
                  ["@modules/{name}/components/", "Domain-specific, only this module uses", "AdminCard, TenantBadge, RolePicker"],
                  ["src/app/{route}/", "Route-specific tiny client fragments only", "DarkModeToggle (extracted for SSR)"],
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
