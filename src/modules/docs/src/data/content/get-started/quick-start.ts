import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "getStarted.quickStart.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.quickStart.backendTitle",
    id: "backend-quickstart",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "getStarted.quickStart.backendStep1Title",
        contentKey: "getStarted.quickStart.backendStep1Content",
        code: "cd SCRIPE-Backend\ndotnet restore",
        codeLanguage: "bash",
      },
      {
        titleKey: "getStarted.quickStart.backendStep2Title",
        contentKey: "getStarted.quickStart.backendStep2Content",
        code: `dotnet ef database update \\
  -p src/Modules/Identity/Identity.Infrastructure \\
  -s src/Host/API`,
        codeLanguage: "bash",
        codeFilename: "Apply migrations",
      },
      {
        titleKey: "getStarted.quickStart.backendStep3Title",
        contentKey: "getStarted.quickStart.backendStep3Content",
        code: "dotnet run --project src/Host/API",
        codeLanguage: "bash",
      },
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "getStarted.quickStart.backendRunningTip",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.quickStart.frontendTitle",
    id: "frontend-quickstart",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "getStarted.quickStart.frontendStep1Title",
        contentKey: "getStarted.quickStart.frontendStep1Content",
        code: "cd SCRIPE-Frontend\npnpm install",
        codeLanguage: "bash",
      },
      {
        titleKey: "getStarted.quickStart.frontendStep2Title",
        contentKey: "getStarted.quickStart.frontendStep2Content",
        code: `# .env.local
NEXT_PUBLIC_API_URL=https://localhost:5001
NEXT_PUBLIC_APP_NAME=SCRIPE`,
        codeLanguage: "bash",
        codeFilename: ".env.local",
      },
      {
        titleKey: "getStarted.quickStart.frontendStep3Title",
        contentKey: "getStarted.quickStart.frontendStep3Content",
        code: "pnpm dev",
        codeLanguage: "bash",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.quickStart.defaultCredentialsTitle",
    id: "default-credentials",
  },
  {
    type: "table",
    headers: ["Role", "Email", "Password", "Permissions"],
    rows: [
      ["Super Admin", "admin@scripe.com", "Admin@123", "Full system access, all modules"],
      ["Tenant Admin", "tenant@scripe.com", "Tenant@123", "Scoped to tenant, manage users"],
      ["Regular User", "user@scripe.com", "User@123", "Read-only, limited actions"],
    ],
  },
  {
    type: "info",
    variant: "danger",
    contentKey: "getStarted.quickStart.credentialsWarning",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.quickStart.verifyInstallTitle",
    id: "verify-installation",
  },
  {
    type: "paragraph",
    contentKey: "getStarted.quickStart.verifyInstallIntro",
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Health Check",
        language: "bash",
        code: `curl https://localhost:5001/health
# Expected: {"status":"Healthy","results":{...}}`,
      },
      {
        label: "Swagger",
        language: "bash",
        code: `# Open in browser:
# https://localhost:5001/swagger

# All 18 controllers should appear with documented endpoints`,
      },
      {
        label: "Login Test",
        language: "bash",
        code: `curl -X POST https://localhost:5001/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@scripe.com","password":"Admin@123"}'

# Expected: { "accessToken": "...", "refreshToken": "..." }`,
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.quickStart.scripeCliTitle",
    id: "scripe-cli",
  },
  {
    type: "paragraph",
    contentKey: "getStarted.quickStart.scripeCliIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "SCRIPE CLI Commands",
    code: `# Automatically create a 3-project backend module and frontend route
scripe new-module Inventory

# Scaffold 26 full-stack files (Controllers, Handlers, ViewModels, Zod schemas, Views)
scripe new-feature Inventory Product -p "Name:string:required:max(100),Price:decimal:required,CategoryId:FK:Category:required"

# Generate EF migrations across 3 Databases (SqlServer, Oracle, PostgreSql) simultaneously
scripe db add-migration Initial -m Inventory

# Auto-detect your configured Database provider and update it
scripe db update -m Inventory

# Auto-generate TypeScript models and API clients from Swagger
scripe sync-api https://localhost:5001/swagger/v1/swagger.json -m inventory

# Build the entire platform
scripe build all`,
  },
];

registerPage({
  slug: "get-started/quick-start",
  titleKey: "getStarted.quickStart.title",
  descriptionKey: "getStarted.quickStart.description",
  category: "get-started",
  order: 3,
  sections,
  relatedSlugs: ["get-started/prerequisites", "get-started/project-structure"],
  lastUpdated: "2026-02-19",
});
