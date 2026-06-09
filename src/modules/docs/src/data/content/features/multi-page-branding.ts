import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/multi-page-branding",
  titleKey: "features.multiPageBranding.title",
  category: "features",
  order: 17,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "features.multiPageBranding.section_4_hdr_0",
      "features.multiPageBranding.section_4_hdr_1",
      "features.multiPageBranding.section_4_hdr_2"
    ],
    "rows": [
      [
        "features.multiPageBranding.section_4_cell_0_0",
        "features.multiPageBranding.section_4_cell_0_1",
        "features.multiPageBranding.section_4_cell_0_2"
      ],
      [
        "features.multiPageBranding.section_4_cell_1_0",
        "features.multiPageBranding.section_4_cell_1_1",
        "features.multiPageBranding.section_4_cell_1_2"
      ],
      [
        "features.multiPageBranding.section_4_cell_2_0",
        "features.multiPageBranding.section_4_cell_2_1",
        "features.multiPageBranding.section_4_cell_2_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_6_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_7_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.multiPageBranding.section_8_title",
    "contentKey": "features.multiPageBranding.section_8_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_12_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_14_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    global[\"Global Settings (50+ tokens)\"]\n    override([\"Per-Page Overrides (pages.forgotPassword.*)\"])\n    merged([\"Merged Result (global + override)\"])\n    global -->|\"Base\"| merged\n    override -->|\"Override\"| merged",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_17_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.multiPageBranding.section_18_title",
    "contentKey": "features.multiPageBranding.section_18_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_20_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_22_content"
  },
  {
    "type": "table",
    "headers": [
      "features.multiPageBranding.section_23_hdr_0",
      "features.multiPageBranding.section_23_hdr_1",
      "features.multiPageBranding.section_23_hdr_2"
    ],
    "rows": [
      [
        "features.multiPageBranding.section_23_cell_0_0",
        "features.multiPageBranding.section_23_cell_0_1",
        "features.multiPageBranding.section_23_cell_0_2"
      ],
      [
        "features.multiPageBranding.section_23_cell_1_0",
        "features.multiPageBranding.section_23_cell_1_1",
        "features.multiPageBranding.section_23_cell_1_2"
      ],
      [
        "features.multiPageBranding.section_23_cell_2_0",
        "features.multiPageBranding.section_23_cell_2_1",
        "features.multiPageBranding.section_23_cell_2_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_25_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_27_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_29_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_31_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_33_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    apply[\"Apply Theme (from marketplace)\"]\n    global2([\"Merge 50+ global tokens to draft\"])\n    pages{{\"Check theme.pages for overrides\"}}\n    merge([\"Merge each page's overrides to draft\"])\n    apply --> global2\n    global2 --> pages\n    pages --> merge",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_36_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_38_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_40_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_41_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"version\": \"2.0\",\n  \"selectedLayout\": \"split-right\",\n  \"primaryColor\": \"#1e40af\",\n  \"fontFamily\": \"Inter\",\n  \"pageOverrides\": {\n    \"login\": {\n      \"panelHeadline\": \"Welcome Back\",\n      \"panelSubtitle\": \"Sign in to continue\"\n    },\n    \"forgotPassword\": {\n      \"selectedLayout\": \"centered\",\n      \"panelHeadline\": \"Password Recovery\",\n      \"panelSubtitle\": \"We'll help you get back in\",\n      \"overlayColor\": \"rgba(30, 64, 175, 0.3)\"\n    },\n    \"resetPassword\": {\n      \"panelHeadline\": \"Create New Password\",\n      \"panelSubtitle\": \"Choose a strong password\"\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_43_title",
    "id": "sec_43"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_44_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.multiPageBranding.section_45_title",
    "id": "sec_45"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_46_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_47_title",
    "id": "sec_47"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_48_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.multiPageBranding.section_49_title",
    "contentKey": "features.multiPageBranding.section_49_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_51_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_52_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_53_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.multiPageBranding.section_54_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.multiPageBranding.section_55_title",
    "id": "sec_55"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.multiPageBranding.section_56_item_0",
      "features.multiPageBranding.section_56_item_1",
      "features.multiPageBranding.section_56_item_2"
    ]
  }
],
  relatedSlugs: [
  "features/theme-marketplace",
  "features/login-customizer",
  "features/login-page-builder"
],
  lastUpdated: "2026-06-09",
});
