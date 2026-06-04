import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeStudio.intro",
  },

  // ─── Architecture ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeStudio.architectureTitle",
    id: "architecture",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeStudio.architectureIntro",
  },

  // ─── Security Model ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeStudio.securityTitle",
    id: "security",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeStudio.securityIntro",
  },

  // ─── Features ───────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeStudio.featuresTitle",
    id: "features",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "infrastructure.scripeStudio.featureDashboard",
      "infrastructure.scripeStudio.featureModules",
      "infrastructure.scripeStudio.featureGenerators",
      "infrastructure.scripeStudio.featureDevServers",
      "infrastructure.scripeStudio.featureDatabase",
      "infrastructure.scripeStudio.featureDocker",
      "infrastructure.scripeStudio.featureTerminal",
      "infrastructure.scripeStudio.featureConfig",
      "infrastructure.scripeStudio.featurePackages",
      "infrastructure.scripeStudio.featureSecurity",
    ],
  },

  // ─── CLI Commands ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeStudio.cliCommandsTitle",
    id: "cli-commands",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeStudio.cliCommandsIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "Studio Control Commands",
    code: `# Launch Studio in production mode (auto-opens browser)
$ scripe studio

# Launch Studio in developer mode with hot-reloading enabled
$ scripe studio --dev

# Run build engine for Studio (without starting the service)
$ scripe studio build

# Start Studio with custom ports
$ scripe studio --port 4300 --engine-port 4301

# Start Studio without auto-opening the browser (headless mode)
$ scripe studio --no-browser`,
  },
];

registerPage({
  slug: "infrastructure/scripe-studio",
  titleKey: "infrastructure.scripeStudio.title",
  descriptionKey: "infrastructure.scripeStudio.description",
  category: "infrastructure",
  order: 11,
  sections,
  relatedSlugs: ["infrastructure/scripe-cli", "get-started/overview"],
  lastUpdated: "2026-06-04",
});
