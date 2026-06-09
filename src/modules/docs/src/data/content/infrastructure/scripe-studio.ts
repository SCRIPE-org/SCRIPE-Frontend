import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/scripe-studio",
  titleKey: "infrastructure.scripeStudio.title",
  category: "infrastructure",
  order: 11,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeStudio.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeStudio.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeStudio.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeStudio.section_3_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeStudio.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeStudio.section_5_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeStudio.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.scripeStudio.section_7_item_0",
      "infrastructure.scripeStudio.section_7_item_1",
      "infrastructure.scripeStudio.section_7_item_2",
      "infrastructure.scripeStudio.section_7_item_3",
      "infrastructure.scripeStudio.section_7_item_4",
      "infrastructure.scripeStudio.section_7_item_5",
      "infrastructure.scripeStudio.section_7_item_6",
      "infrastructure.scripeStudio.section_7_item_7",
      "infrastructure.scripeStudio.section_7_item_8",
      "infrastructure.scripeStudio.section_7_item_9"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeStudio.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeStudio.section_9_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.scripeStudio.section_10_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "# Launch Studio in production mode (auto-opens browser)\n$ scripe studio\n\n# Launch Studio in developer mode with hot-reloading enabled\n$ scripe studio --dev\n\n# Run build engine for Studio (without starting the service)\n$ scripe studio build\n\n# Start Studio with custom ports\n$ scripe studio --port 4300 --engine-port 4301\n\n# Start Studio without auto-opening the browser (headless mode)\n$ scripe studio --no-browser",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.scripeStudio.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.scripeStudio.section_13_item_0",
      "infrastructure.scripeStudio.section_13_item_1"
    ]
  }
],
  relatedSlugs: [
  "infrastructure/scripe-cli",
  "get-started/overview"
],
  lastUpdated: "2026-06-09",
});
