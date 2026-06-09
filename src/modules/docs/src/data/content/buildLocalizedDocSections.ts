import type { DocSection } from "../../domain/entities/DocSection";

function sourceMapFor(slug: string): string {
  const parts = slug.split("/");
  const section = parts[0] ?? "docs";
  const page = parts.at(-1) ?? slug;
  const lines = [
    `Docs page source: SCRIPE-Frontend/src/modules/docs/src/data/content/${slug}.ts`,
    "Docs runtime: SCRIPE-Frontend/src/modules/docs/src/presentation/providers/DocsI18nProvider.tsx",
    "Docs registry: SCRIPE-Frontend/src/modules/docs/src/data/content/registry.ts",
    "Docs navigation: SCRIPE-Frontend/src/modules/docs/src/data/navigation.ts",
  ];

  if (section === "commercial") {
    lines.push(
      "Commercial source scope: SCRIPE-Frontend/src/modules/docs/src/data/content/commercial"
    );
  }

  if (section === "api-reference") {
    lines.push("API controllers: SCRIPE-Backend/src/Host/API/Controllers");
    lines.push("Application handlers: SCRIPE-Backend/src/Modules/*/*.Application");
  }

  if (section === "features") {
    lines.push("Feature backend modules: SCRIPE-Backend/src/Modules");
    lines.push("Feature frontend modules: SCRIPE-Frontend/src/modules");
  }

  if (section === "modules") {
    lines.push("Module backend source: SCRIPE-Backend/src/Modules");
    lines.push("Module frontend source: SCRIPE-Frontend/src/modules");
  }

  if (section === "architecture") {
    lines.push("Backend architecture: SCRIPE-Backend/src");
    lines.push("Frontend architecture: SCRIPE-Frontend/src");
    lines.push("CLI and Studio: tools/scripe-cli; tools/scripe-studio");
  }

  if (section === "frontend") {
    lines.push("Frontend app router: SCRIPE-Frontend/src/app");
    lines.push("Frontend modules: SCRIPE-Frontend/src/modules");
    lines.push("Shared UI/runtime: SCRIPE-Frontend/src/core");
  }

  if (section === "infrastructure") {
    lines.push("Infrastructure source: SCRIPE-Backend/src/Core; SCRIPE-Backend/src/Host/API");
    lines.push("Tooling source: tools/scripe-cli; tools/scripe-studio");
  }

  if (section === "security") {
    lines.push("Security source: SCRIPE-Backend/src/Core; SCRIPE-Backend/src/Modules/Identity");
    lines.push("Frontend guards/interceptors: SCRIPE-Frontend/src/core");
  }

  if (page.includes("entitlement") || slug.includes("editions") || slug.includes("subscriptions")) {
    lines.push("Entitlements module: SCRIPE-Backend/src/Modules/Entitlements");
    lines.push("Entitlements UI: SCRIPE-Frontend/src/modules/entitlements");
  }

  if (page.includes("compliance")) {
    lines.push("Compliance module: SCRIPE-Backend/src/Modules/Compliance");
    lines.push("Compliance UI: SCRIPE-Frontend/src/modules/compliance");
  }

  if (page.includes("marketplace")) {
    lines.push("Marketplace module: SCRIPE-Backend/src/Modules/Marketplace");
    lines.push("Marketplace UI: SCRIPE-Frontend/src/modules/marketplace");
  }

  if (page.includes("plugins")) {
    lines.push("Plugins module: SCRIPE-Backend/src/Modules/Plugins");
    lines.push("Plugins UI: SCRIPE-Frontend/src/modules/plugins");
  }

  if (
    page.includes("tenant") ||
    page.includes("user") ||
    page.includes("role") ||
    page.includes("auth") ||
    page.includes("sso")
  ) {
    lines.push("Identity module: SCRIPE-Backend/src/Modules/Identity");
    lines.push("Identity UI: SCRIPE-Frontend/src/modules/identity");
  }

  return Array.from(new Set(lines)).join("\n");
}

export function buildLocalizedDocSections(baseKey: string, slug: string): DocSection[] {
  return [
    {
      type: "heading",
      level: 2,
      titleKey: `${baseKey}.overviewTitle`,
      id: "overview",
    },
    {
      type: "paragraph",
      contentKey: `${baseKey}.overview`,
    },
    {
      type: "feature-grid",
      columns: 2,
      items: [
        {
          icon: "layers",
          titleKey: `${baseKey}.architectureTitle`,
          descriptionKey: `${baseKey}.architectureDesc`,
        },
        {
          icon: "database",
          titleKey: `${baseKey}.dataTitle`,
          descriptionKey: `${baseKey}.dataDesc`,
        },
        {
          icon: "shield",
          titleKey: `${baseKey}.governanceTitle`,
          descriptionKey: `${baseKey}.governanceDesc`,
        },
        {
          icon: "check-circle",
          titleKey: `${baseKey}.verificationTitle`,
          descriptionKey: `${baseKey}.verificationDesc`,
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      titleKey: `${baseKey}.sourceMapTitle`,
      id: "source-map",
    },
    {
      type: "paragraph",
      contentKey: `${baseKey}.sourceMapIntro`,
    },
    {
      type: "code",
      language: "text",
      filename: "source-map.txt",
      code: sourceMapFor(slug),
    },
    {
      type: "heading",
      level: 2,
      titleKey: `${baseKey}.operatingModelTitle`,
      id: "operating-model",
    },
    {
      type: "paragraph",
      contentKey: `${baseKey}.operatingModel`,
    },
    {
      type: "info",
      variant: "note",
      titleKey: `${baseKey}.localizationNoteTitle`,
      contentKey: `${baseKey}.localizationNote`,
    },
  ];
}
