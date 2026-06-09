import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "frontend/component-library",
  titleKey: "frontend.componentLibrary.title",
  category: "frontend",
  order: 240,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "frontend.componentLibrary.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.componentLibrary.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.componentLibrary.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.componentLibrary.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "frontend.componentLibrary.section_4_hdr_0",
      "frontend.componentLibrary.section_4_hdr_1",
      "frontend.componentLibrary.section_4_hdr_2"
    ],
    "rows": [
      [
        "frontend.componentLibrary.section_4_cell_0_0",
        "frontend.componentLibrary.section_4_cell_0_1",
        "frontend.componentLibrary.section_4_cell_0_2"
      ],
      [
        "frontend.componentLibrary.section_4_cell_1_0",
        "frontend.componentLibrary.section_4_cell_1_1",
        "frontend.componentLibrary.section_4_cell_1_2"
      ],
      [
        "frontend.componentLibrary.section_4_cell_2_0",
        "frontend.componentLibrary.section_4_cell_2_1",
        "frontend.componentLibrary.section_4_cell_2_2"
      ],
      [
        "frontend.componentLibrary.section_4_cell_3_0",
        "frontend.componentLibrary.section_4_cell_3_1",
        "frontend.componentLibrary.section_4_cell_3_2"
      ],
      [
        "frontend.componentLibrary.section_4_cell_4_0",
        "frontend.componentLibrary.section_4_cell_4_1",
        "frontend.componentLibrary.section_4_cell_4_2"
      ],
      [
        "frontend.componentLibrary.section_4_cell_5_0",
        "frontend.componentLibrary.section_4_cell_5_1",
        "frontend.componentLibrary.section_4_cell_5_2"
      ],
      [
        "frontend.componentLibrary.section_4_cell_6_0",
        "frontend.componentLibrary.section_4_cell_6_1",
        "frontend.componentLibrary.section_4_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.componentLibrary.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.componentLibrary.section_6_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// @core/ui/lib/utils.ts\nimport { clsx, type ClassValue } from \"clsx\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n\n// Usage in any component:\n<button className={cn(\n  \"px-4 py-2 rounded-md font-medium\",\n  variant === \"primary\" && \"bg-primary text-white\",\n  variant === \"secondary\" && \"bg-secondary text-secondary-foreground\",\n  disabled && \"opacity-50 cursor-not-allowed\",\n  className  // Allow consumer overrides\n)} />",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.componentLibrary.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.componentLibrary.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.componentLibrary.section_10_content"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "// Simple flat select\n<GenericSelect\n  options={roles}\n  value={selectedRoleId}\n  onChange={setSelectedRoleId}\n  getLabel={(r) => r.name}\n  getValue={(r) => r.id}\n  placeholder={t(\"selectRole\")}\n  searchable\n/>\n\n// Hierarchical tree select (tenants)\n<GenericSelect\n  options={tenants}\n  value={selectedTenantId}\n  onChange={setSelectedTenantId}\n  getLabel={(t) => t.name}\n  getValue={(t) => t.id}\n  getChildren={(t) => t.children}\n  getParentId={(t) => t.parentTenantId}\n  mode=\"tree\"\n  searchable\n  placeholder={t(\"selectTenant\")}\n/>\n\n// Multi-select (permissions)\n<GenericSelect\n  options={permissions}\n  value={selectedPermIds}\n  onChange={setSelectedPermIds}\n  getLabel={(p) => p.name}\n  getValue={(p) => p.id}\n  getGroup={(p) => p.category}\n  mode=\"multi\"\n  searchable\n/>",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.componentLibrary.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.componentLibrary.section_13_content"
  },
  {
    "type": "code",
    "language": "css",
    "code": ":root {\n  /* Light theme tokens */\n  --background: 0 0% 100%;\n  --foreground: 240 10% 3.9%;\n  --card: 0 0% 100%;\n  --card-foreground: 240 10% 3.9%;\n  --primary: 240 5.9% 10%;\n  --primary-foreground: 0 0% 98%;\n  --secondary: 240 4.8% 95.9%;\n  --muted: 240 4.8% 95.9%;\n  --accent: 240 4.8% 95.9%;\n  --destructive: 0 84.2% 60.2%;\n  --border: 240 5.9% 90%;\n  --ring: 240 5.9% 10%;\n  --radius: 0.5rem;\n}\n\n.dark {\n  --background: 240 10% 3.9%;\n  --foreground: 0 0% 98%;\n  --card: 240 10% 3.9%;\n  --primary: 0 0% 98%;\n  --primary-foreground: 240 5.9% 10%;\n  --muted: 240 3.7% 15.9%;\n  --border: 240 3.7% 15.9%;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.componentLibrary.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.componentLibrary.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.componentLibrary.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.componentLibrary.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.componentLibrary.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.componentLibrary.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.componentLibrary.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.componentLibrary.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "table",
    "headers": [
      "frontend.componentLibrary.section_23_hdr_0",
      "frontend.componentLibrary.section_23_hdr_1",
      "frontend.componentLibrary.section_23_hdr_2"
    ],
    "rows": [
      [
        "frontend.componentLibrary.section_23_cell_0_0",
        "frontend.componentLibrary.section_23_cell_0_1",
        "frontend.componentLibrary.section_23_cell_0_2"
      ],
      [
        "frontend.componentLibrary.section_23_cell_1_0",
        "frontend.componentLibrary.section_23_cell_1_1",
        "frontend.componentLibrary.section_23_cell_1_2"
      ],
      [
        "frontend.componentLibrary.section_23_cell_2_0",
        "frontend.componentLibrary.section_23_cell_2_1",
        "frontend.componentLibrary.section_23_cell_2_2"
      ],
      [
        "frontend.componentLibrary.section_23_cell_3_0",
        "frontend.componentLibrary.section_23_cell_3_1",
        "frontend.componentLibrary.section_23_cell_3_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "frontend.componentLibrary.section_24_title",
    "contentKey": "frontend.componentLibrary.section_24_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.componentLibrary.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "frontend.componentLibrary.section_26_item_0",
      "frontend.componentLibrary.section_26_item_1",
      "frontend.componentLibrary.section_26_item_2"
    ]
  }
],
  relatedSlugs: [
  "frontend/crud-system",
  "frontend/localization",
  "architecture/frontend"
],
  lastUpdated: "2026-06-09",
});
