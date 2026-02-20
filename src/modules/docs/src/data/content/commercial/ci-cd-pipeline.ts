import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.ciCdPipeline.intro" },
      { type: "heading", level: 2, titleKey: "commercial.ciCdPipeline.workflowTitle", id: "workflow" },
      {
            type: "flowchart",
            direction: "horizontal",
            title: "CI/CD Pipeline",
            nodes: [
                  { id: "push", label: "Git Push", type: "default" },
                  { id: "lint", label: "Lint + Type Check", type: "info" },
                  { id: "test", label: "Unit Tests", type: "primary" },
                  { id: "build", label: "Build", type: "warning" },
                  { id: "int", label: "Integration Tests", type: "success" },
                  { id: "deploy", label: "Deploy", type: "danger" },
            ],
            connections: [
                  { from: "push", to: "lint" }, { from: "lint", to: "test" },
                  { from: "test", to: "build" }, { from: "build", to: "int" },
                  { from: "int", to: "deploy" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.ciCdPipeline.environmentsTitle", id: "environments" },
      {
            type: "table",
            headers: ["Environment", "Trigger", "Purpose", "Database"],
            rows: [
                  ["Development", "Every commit", "Developer testing", "SQLite / Local SQL"],
                  ["Staging", "PR merge to develop", "QA testing", "Staging SQL Server"],
                  ["UAT", "Manual trigger", "User acceptance", "UAT database"],
                  ["Production", "Tag release", "Live deployment", "Production cluster"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.ciCdPipeline.dockerTitle", id: "docker" },
      { type: "paragraph", contentKey: "commercial.ciCdPipeline.dockerContent" },
      {
            type: "code",
            language: "bash",
            filename: "Docker Deployment Commands",
            code: `# Build and run with Docker Compose
docker-compose up -d

# Scale specific services
docker-compose up -d --scale hr-service=3

# Health check
curl http://localhost:5000/health/ready`,
      },
      { type: "heading", level: 2, titleKey: "commercial.ciCdPipeline.hostingTitle", id: "hosting" },
      {
            type: "table",
            headers: ["Platform", "Support Level", "Notes"],
            rows: [
                  ["Azure App Service", "Full", "Recommended for Azure shops"],
                  ["AWS ECS / Fargate", "Full", "Container-based deployment"],
                  ["IIS (Windows)", "Full", "Traditional Windows hosting"],
                  ["Linux (systemd)", "Full", "Direct Kestrel hosting"],
                  ["Docker / Kubernetes", "Full", "Container orchestration"],
                  ["On-Premise", "Full", "Air-gapped environments"],
            ],
      },
];

registerPage({
      slug: "commercial/ci-cd-pipeline",
      titleKey: "commercial.ciCdPipeline.title",
      descriptionKey: "commercial.ciCdPipeline.description",
      category: "commercial-integration",
      order: 4,
      sections,
      relatedSlugs: ["commercial/deployment-modes", "commercial/testing-strategy"],
      lastUpdated: "2026-02-20",
});
