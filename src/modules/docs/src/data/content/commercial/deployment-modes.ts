import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      {
            type: "paragraph",
            contentKey: "commercial.deploymentModes.intro",
      },
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.deploymentModes.comparisonTitle",
            id: "mode-comparison",
      },
      {
            type: "table",
            headers: ["Aspect", "Monolith", "Gateway", "Microservice"],
            rows: [
                  ["Processes", "1", "N (1 per module group)", "N (1 per module)"],
                  ["Database", "Shared", "Shared or split", "Independent per service"],
                  ["Scaling", "Vertical (bigger server)", "Per-module group", "Per-module"],
                  ["Latency", "In-process (fastest)", "HTTP between modules", "HTTP + service mesh"],
                  ["DevOps", "Minimal", "Moderate (API gateway)", "Full K8s + monitoring"],
                  ["Cost", "Lowest", "Medium", "Highest"],
                  ["Team Size", "1-5 developers", "5-15 developers", "15+ developers"],
                  ["Switching", "Config change", "Config + gateway setup", "Config + K8s manifests"],
            ],
      },
      // ─── Monolith Mode ─────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.deploymentModes.monolithTitle",
            id: "monolith-mode",
      },
      {
            type: "code",
            language: "json",
            filename: "Monolith Configuration",
            code: `{ "DeploymentMode": "Monolith" }`,
      },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "zap", titleKey: "commercial.deploymentModes.monolithAdv1", descriptionKey: "commercial.deploymentModes.monolithAdv1Desc" },
                  { icon: "cpu", titleKey: "commercial.deploymentModes.monolithAdv2", descriptionKey: "commercial.deploymentModes.monolithAdv2Desc" },
                  { icon: "bug", titleKey: "commercial.deploymentModes.monolithAdv3", descriptionKey: "commercial.deploymentModes.monolithAdv3Desc" },
                  { icon: "package", titleKey: "commercial.deploymentModes.monolithAdv4", descriptionKey: "commercial.deploymentModes.monolithAdv4Desc" },
            ],
      },
      // ─── Gateway Mode ──────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.deploymentModes.gatewayTitle",
            id: "gateway-mode",
      },
      {
            type: "code",
            language: "json",
            filename: "Gateway Configuration",
            code: `{ "DeploymentMode": "Gateway" }`,
      },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "trending-up", titleKey: "commercial.deploymentModes.gatewayAdv1", descriptionKey: "commercial.deploymentModes.gatewayAdv1Desc" },
                  { icon: "shield", titleKey: "commercial.deploymentModes.gatewayAdv2", descriptionKey: "commercial.deploymentModes.gatewayAdv2Desc" },
                  { icon: "database", titleKey: "commercial.deploymentModes.gatewayAdv3", descriptionKey: "commercial.deploymentModes.gatewayAdv3Desc" },
                  { icon: "route", titleKey: "commercial.deploymentModes.gatewayAdv4", descriptionKey: "commercial.deploymentModes.gatewayAdv4Desc" },
            ],
      },
      // ─── Microservice Mode ─────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.deploymentModes.microserviceTitle",
            id: "microservice-mode",
      },
      {
            type: "code",
            language: "json",
            filename: "Microservice Configuration",
            code: `{ "DeploymentMode": "Microservice" }`,
      },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "layers", titleKey: "commercial.deploymentModes.msAdv1", descriptionKey: "commercial.deploymentModes.msAdv1Desc" },
                  { icon: "rocket", titleKey: "commercial.deploymentModes.msAdv2", descriptionKey: "commercial.deploymentModes.msAdv2Desc" },
                  { icon: "code", titleKey: "commercial.deploymentModes.msAdv3", descriptionKey: "commercial.deploymentModes.msAdv3Desc" },
                  { icon: "alert-triangle", titleKey: "commercial.deploymentModes.msAdv4", descriptionKey: "commercial.deploymentModes.msAdv4Desc" },
            ],
      },
      // ─── Migration Path ────────────────────────────────────────
      {
            type: "heading",
            level: 2,
            titleKey: "commercial.deploymentModes.migrationTitle",
            id: "migration-path",
      },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.deploymentModes.step1Title", contentKey: "commercial.deploymentModes.step1Desc" },
                  { titleKey: "commercial.deploymentModes.step2Title", contentKey: "commercial.deploymentModes.step2Desc" },
                  { titleKey: "commercial.deploymentModes.step3Title", contentKey: "commercial.deploymentModes.step3Desc" },
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "commercial.deploymentModes.noCodeChanges",
      },
];

registerPage({
      slug: "commercial/deployment-modes",
      titleKey: "commercial.deploymentModes.title",
      descriptionKey: "commercial.deploymentModes.description",
      category: "commercial-platform",
      order: 2,
      sections,
      relatedSlugs: ["commercial/platform-architecture", "commercial/performance", "commercial/deployment-options"],
      lastUpdated: "2026-02-19",
});
