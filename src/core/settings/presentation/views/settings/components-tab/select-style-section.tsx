"use client";

import { useState } from "react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import GenericSelect from "@core/crud/components/generic-select";
import { cn } from "@core/common/utils";

/** Select/multi-select style showcase — all 19 design variants */
export function SelectStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();
  const [multiSelectDemo, setMultiSelectDemo] = useState<string[]>([]);
  const [styleSelections, setStyleSelections] = useState<Record<string, string | string[]>>({});

  const styleVariations = [
    {
      style: "default",
      label: t("settings.selectStyle.options.default"),
      options: [
        { value: "html", label: t("components.multiSelect.categories.webTech.html") },
        { value: "css", label: t("components.multiSelect.categories.webTech.css") },
        { value: "javascript", label: t("components.multiSelect.categories.webTech.javascript") },
      ],
    },
    {
      style: "modern",
      label: t("settings.selectStyle.options.modern"),
      options: [
        { value: "react", label: t("components.multiSelect.categories.webTech.react") },
        { value: "vue", label: t("components.multiSelect.categories.webTech.vue") },
        { value: "angular", label: t("components.multiSelect.categories.webTech.angular") },
      ],
    },
    {
      style: "glass",
      label: t("settings.selectStyle.options.glass"),
      options: [
        { value: "figma", label: t("components.multiSelect.categories.design.figma") },
        { value: "sketch", label: t("components.multiSelect.categories.design.sketch") },
        { value: "adobe", label: t("components.multiSelect.categories.design.adobe") },
      ],
    },
    {
      style: "outlined",
      label: t("settings.selectStyle.options.outlined"),
      options: [
        { value: "nodejs", label: t("components.multiSelect.categories.backend.nodejs") },
        { value: "python", label: t("components.multiSelect.categories.backend.python") },
        { value: "java", label: t("components.multiSelect.categories.backend.java") },
      ],
    },
    {
      style: "filled",
      label: t("settings.selectStyle.options.filled"),
      options: [
        { value: "mysql", label: t("components.multiSelect.categories.database.mysql") },
        { value: "postgres", label: t("components.multiSelect.categories.database.postgres") },
        { value: "mongodb", label: t("components.multiSelect.categories.database.mongodb") },
      ],
    },
    {
      style: "minimal",
      label: t("settings.selectStyle.options.minimal"),
      options: [
        { value: "git", label: t("components.multiSelect.categories.devops.git") },
        { value: "github", label: t("components.multiSelect.categories.devops.github") },
        { value: "gitlab", label: t("components.multiSelect.categories.devops.gitlab") },
      ],
    },
    {
      style: "elegant",
      label: t("settings.selectStyle.options.elegant"),
      options: [
        { value: "aws", label: t("components.multiSelect.categories.cloud.aws") },
        { value: "azure", label: t("components.multiSelect.categories.cloud.azure") },
        { value: "gcp", label: t("components.multiSelect.categories.cloud.gcp") },
      ],
    },
    {
      style: "professional",
      label: t("settings.selectStyle.options.professional"),
      options: [
        { value: "docker", label: t("components.multiSelect.categories.devops.docker") },
        { value: "kubernetes", label: t("components.multiSelect.categories.devops.kubernetes") },
        { value: "jenkins", label: t("components.multiSelect.categories.devops.jenkins") },
      ],
    },
    {
      style: "neon",
      label: t("settings.selectStyle.options.neon"),
      options: [
        {
          value: "cybersecurity",
          label: t("components.multiSelect.categories.security.cybersecurity"),
        },
        {
          value: "ethicalHacking",
          label: t("components.multiSelect.categories.security.ethicalHacking"),
        },
        {
          value: "penetrationTesting",
          label: t("components.multiSelect.categories.security.penetrationTesting"),
        },
      ],
    },
    {
      style: "gradient",
      label: t("settings.selectStyle.options.gradient"),
      options: [
        { value: "uiDesign", label: t("components.multiSelect.categories.ux.uiDesign") },
        { value: "uxResearch", label: t("components.multiSelect.categories.ux.uxResearch") },
        { value: "userTesting", label: t("components.multiSelect.categories.ux.userTesting") },
      ],
    },
    {
      style: "neumorphism",
      label: t("settings.selectStyle.options.neumorphism"),
      options: [
        { value: "ios", label: t("components.multiSelect.categories.mobile.ios") },
        { value: "android", label: t("components.multiSelect.categories.mobile.android") },
        { value: "reactNative", label: t("components.multiSelect.categories.mobile.reactNative") },
      ],
    },
    {
      style: "cyberpunk",
      label: t("settings.selectStyle.options.cyberpunk"),
      options: [
        { value: "blockchain", label: t("components.multiSelect.categories.security.blockchain") },
        { value: "crypto", label: t("components.multiSelect.categories.security.crypto") },
        {
          value: "machineLearning",
          label: t("components.multiSelect.categories.ai.machineLearning"),
        },
      ],
    },
    {
      style: "luxury",
      label: t("settings.selectStyle.options.luxury"),
      options: [
        { value: "premium", label: t("components.multiSelect.categories.business.premium") },
        { value: "enterprise", label: t("components.multiSelect.categories.business.enterprise") },
        { value: "consulting", label: t("components.multiSelect.categories.business.consulting") },
      ],
    },
    {
      style: "quantum",
      label: t("settings.selectStyle.options.quantum"),
      options: [
        {
          value: "quantumComputing",
          label: t("components.multiSelect.categories.ai.quantumComputing"),
        },
        {
          value: "neuralNetworks",
          label: t("components.multiSelect.categories.ai.neuralNetworks"),
        },
        { value: "deepLearning", label: t("components.multiSelect.categories.ai.deepLearning") },
      ],
    },
    {
      style: "nebula",
      label: t("settings.selectStyle.options.nebula"),
      options: [
        {
          value: "spaceExploration",
          label: t("components.multiSelect.categories.science.spaceExploration"),
        },
        { value: "astronomy", label: t("components.multiSelect.categories.science.astronomy") },
        {
          value: "astrophysics",
          label: t("components.multiSelect.categories.science.astrophysics"),
        },
      ],
    },
    {
      style: "prism",
      label: t("settings.selectStyle.options.prism"),
      options: [
        { value: "optics", label: t("components.multiSelect.categories.science.optics") },
        {
          value: "photography",
          label: t("components.multiSelect.categories.creative.photography"),
        },
        {
          value: "visualEffects",
          label: t("components.multiSelect.categories.creative.visualEffects"),
        },
      ],
    },
    {
      style: "stellar",
      label: t("settings.selectStyle.options.stellar"),
      options: [
        { value: "solarEnergy", label: t("components.multiSelect.categories.energy.solarEnergy") },
        {
          value: "renewableEnergy",
          label: t("components.multiSelect.categories.energy.renewableEnergy"),
        },
        {
          value: "sustainability",
          label: t("components.multiSelect.categories.energy.sustainability"),
        },
      ],
    },
    {
      style: "vortex",
      label: t("settings.selectStyle.options.vortex"),
      options: [
        {
          value: "fluidDynamics",
          label: t("components.multiSelect.categories.physics.fluidDynamics"),
        },
        {
          value: "aerodynamics",
          label: t("components.multiSelect.categories.physics.aerodynamics"),
        },
        { value: "turbulence", label: t("components.multiSelect.categories.physics.turbulence") },
      ],
    },
    {
      style: "phoenix",
      label: t("settings.selectStyle.options.phoenix"),
      options: [
        { value: "gameDesign", label: t("components.multiSelect.categories.gaming.gameDesign") },
        { value: "animation", label: t("components.multiSelect.categories.creative.animation") },
        { value: "digitalArt", label: t("components.multiSelect.categories.creative.digitalArt") },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("components.multiSelect.title")}</CardTitle>
        <CardDescription>{t("components.multiSelect.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current style demo */}
          <div className="space-y-3">
            <h4 className="font-medium">
              {t("components.multiSelect.currentStyle")}: {settings.selectStyle}
            </h4>
            <div className="max-w-md">
              <GenericSelect
                type="multi"
                options={[
                  { value: "react", label: t("components.multiSelect.categories.webTech.react") },
                  { value: "vue", label: t("components.multiSelect.categories.webTech.vue") },
                  {
                    value: "angular",
                    label: t("components.multiSelect.categories.webTech.angular"),
                  },
                  { value: "svelte", label: t("components.multiSelect.categories.webTech.svelte") },
                  { value: "nextjs", label: t("components.multiSelect.categories.webTech.nextjs") },
                  {
                    value: "typescript",
                    label: t("components.multiSelect.categories.webTech.typescript"),
                  },
                ]}
                value={multiSelectDemo}
                onValueChange={(value: string | string[]) =>
                  setMultiSelectDemo(Array.isArray(value) ? value : [value])
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {multiSelectDemo.length > 0 ? multiSelectDemo.join(", ") : "None"}
            </p>
          </div>

          {/* Style variations grid */}
          <div className="space-y-3">
            <h4 className="font-medium">{t("components.multiSelect.availableStyles")}</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {styleVariations.map(({ style, label, options }) => (
                <div key={style} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{label}</h5>
                    <button
                      onClick={() => settings.setSelectStyle(style as any)}
                      className={cn(
                        "rounded px-2 py-1 text-xs transition-colors",
                        settings.selectStyle === style
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted-foreground/20"
                      )}
                    >
                      {settings.selectStyle === style
                        ? t("components.multiSelect.buttons.active")
                        : t("components.multiSelect.buttons.apply")}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {t("components.unifiedSelect.types.single")}
                      </label>
                      <GenericSelect
                        type="single"
                        design={style as any}
                        options={options.slice(0, 3)}
                        value={
                          (styleSelections[`${style}-single`] as string) || options[0]?.value || ""
                        }
                        onValueChange={(v: string | string[]) =>
                          setStyleSelections((prev) => ({
                            ...prev,
                            [`${style}-single`]: typeof v === "string" ? v : v[0],
                          }))
                        }
                        placeholder={`${style} Single Select`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {t("components.unifiedSelect.types.searchable")}
                      </label>
                      <GenericSelect
                        type="searchable"
                        design={style as any}
                        options={options}
                        value={(styleSelections[`${style}-search`] as string) || ""}
                        onValueChange={(v: string | string[]) =>
                          setStyleSelections((prev) => ({
                            ...prev,
                            [`${style}-search`]: typeof v === "string" ? v : v[0],
                          }))
                        }
                        placeholder={`Search ${style} options...`}
                        searchPlaceholder="Type to search..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {t("components.unifiedSelect.types.multi")}
                      </label>
                      <GenericSelect
                        type="multi"
                        design={style as any}
                        options={options}
                        value={
                          styleSelections[`${style}-multi`] || [options[0]?.value].filter(Boolean)
                        }
                        onValueChange={(v: string | string[]) =>
                          setStyleSelections((prev) => ({
                            ...prev,
                            [`${style}-multi`]: Array.isArray(v) ? v : [v],
                          }))
                        }
                        placeholder={`Multi-select ${style} items...`}
                        searchPlaceholder="Search and select multiple..."
                        maxSelectedDisplay={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Server-side search demo */}
          <div className="space-y-3">
            <h4 className="font-medium">{t("components.multiSelect.serverSearchDemo")}</h4>
            <div className="max-w-md">
              <GenericSelect
                type="multi"
                searchType="server"
                options={[]}
                value={[]}
                onValueChange={() => {}}
                onServerSearch={async (query: string) => {
                  await new Promise((r) => setTimeout(r, 500));
                  return [
                    {
                      value: `${query}-1`,
                      label: `${query} ${t("components.multiSelect.serverSearchResult")} 1`,
                    },
                    {
                      value: `${query}-2`,
                      label: `${query} ${t("components.multiSelect.serverSearchResult")} 2`,
                    },
                    {
                      value: `${query}-3`,
                      label: `${query} ${t("components.multiSelect.serverSearchResult")} 3`,
                    },
                  ];
                }}
                placeholder={t("components.multiSelect.serverSearchPlaceholder")}
                searchPlaceholder={t("components.multiSelect.serverSearchSearchPlaceholder")}
                searchingText={t("components.multiSelect.serverSearchSearchingText")}
                noResultsText={t("components.multiSelect.serverSearchNoResultsText")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("components.multiSelect.serverSearchDescription")}
            </p>
          </div>

          {/* Tree select demo */}
          <div className="space-y-3">
            <h4 className="font-medium">{t("components.treeSelect.title")}</h4>
            <div className="max-w-md">
              <GenericSelect
                type="tree"
                treeData={[
                  {
                    value: "warehouse-1",
                    label: "Main Warehouse",
                    children: [
                      {
                        value: "section-a",
                        label: "Section A",
                        children: [
                          { value: "shelf-1", label: "Shelf 1" },
                          { value: "shelf-2", label: "Shelf 2" },
                        ],
                      },
                      {
                        value: "section-b",
                        label: "Section B",
                        children: [
                          { value: "shelf-3", label: "Shelf 3" },
                          { value: "shelf-4", label: "Shelf 4" },
                        ],
                      },
                    ],
                  },
                  {
                    value: "warehouse-2",
                    label: "Secondary Warehouse",
                    children: [
                      { value: "area-1", label: "Storage Area 1" },
                      { value: "area-2", label: "Storage Area 2" },
                    ],
                  },
                ]}
                placeholder={t("components.treeSelect.placeholder")}
                searchPlaceholder={t("components.treeSelect.searchPlaceholder")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("components.treeSelect.description")}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              <strong>{t("components.multiSelect.features")}:</strong>{" "}
              {t("components.multiSelect.featuresDescription")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
