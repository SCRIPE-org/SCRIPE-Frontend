import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "getStarted.prerequisites.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.prerequisites.requiredToolsTitle",
    id: "required-tools",
  },
  {
    type: "table",
    headers: ["Tool", "Minimum Version", "Recommended", "Purpose"],
    rows: [
      [".NET SDK", "10.0", "10.0.x (latest)", "Backend compilation and runtime"],
      ["Node.js", "20 LTS", "22 LTS", "Frontend build tooling"],
      ["pnpm", "9.0", "9.x (latest)", "Fast, disk-efficient package manager"],
      ["Git", "2.40", "2.45+", "Version control"],
      ["Docker", "24.0", "27.x", "Containerized development (optional)"],
      ["Visual Studio / Rider", "2025", "Latest", "Backend IDE"],
      ["VS Code", "1.90+", "Latest", "Frontend IDE"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.prerequisites.databaseTitle",
    id: "database",
  },
  {
    type: "paragraph",
    contentKey: "getStarted.prerequisites.databaseIntro",
  },
  {
    type: "table",
    headers: ["Database", "Version", "Connection String Key", "EF Provider"],
    rows: [
      ["SQL Server", "2019+", "DefaultConnection", "Microsoft.EntityFrameworkCore.SqlServer"],
      ["PostgreSQL", "14+", "DefaultConnection", "Npgsql.EntityFrameworkCore.PostgreSQL"],
      ["Oracle", "19c+", "DefaultConnection", "Oracle.EntityFrameworkCore"],
      ["SQLite", "3.x", "DefaultConnection", "Microsoft.EntityFrameworkCore.Sqlite"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "getStarted.prerequisites.databaseTip",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.prerequisites.envSetupTitle",
    id: "env-setup",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "getStarted.prerequisites.step1Title",
        contentKey: "getStarted.prerequisites.step1Content",
        code: "dotnet --version\nnode --version\npnpm --version",
        codeLanguage: "bash",
        codeFilename: "Verify installations",
      },
      {
        titleKey: "getStarted.prerequisites.step2Title",
        contentKey: "getStarted.prerequisites.step2Content",
        code: "git clone https://github.com/seifmoustafa/NEXORA.git\ncd NEXORA\ngit submodule update --init --recursive",
        codeLanguage: "bash",
        codeFilename: "Clone with submodules",
      },
      {
        titleKey: "getStarted.prerequisites.step3Title",
        contentKey: "getStarted.prerequisites.step3Content",
        code: `// appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=NEXORA;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "DatabaseProvider": "SqlServer"
}`,
        codeLanguage: "json",
        codeFilename: "appsettings.Development.json",
      },
      {
        titleKey: "getStarted.prerequisites.step4Title",
        contentKey: "getStarted.prerequisites.step4Content",
        code: "cd NEXORA-Backend\ndotnet restore\ndotnet ef database update -p src/Modules/Identity/Identity.Infrastructure -s src/Host/API",
        codeLanguage: "bash",
        codeFilename: "Backend setup",
      },
      {
        titleKey: "getStarted.prerequisites.step5Title",
        contentKey: "getStarted.prerequisites.step5Content",
        code: "cd NEXORA-Frontend\npnpm install\ncp .env.example .env.local",
        codeLanguage: "bash",
        codeFilename: "Frontend setup",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.prerequisites.dockerTitle",
    id: "docker-quickstart",
  },
  {
    type: "code",
    language: "yaml",
    filename: "docker-compose.yml (development)",
    code: `version: '3.8'
services:
  nexora-db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "YourStrong@Passw0rd"
    ports:
      - "1433:1433"
    volumes:
      - nexora-data:/var/opt/mssql

  nexora-redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nexora-api:
    build:
      context: ./NEXORA-Backend
      dockerfile: Dockerfile
    environment:
      ConnectionStrings__DefaultConnection: "Server=nexora-db;Database=NEXORA;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true"
      DatabaseProvider: "SqlServer"
    ports:
      - "5000:5000"
    depends_on:
      - nexora-db
      - nexora-redis

volumes:
  nexora-data:`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "getStarted.prerequisites.dockerNote",
  },
];

registerPage({
  slug: "get-started/prerequisites",
  titleKey: "getStarted.prerequisites.title",
  descriptionKey: "getStarted.prerequisites.description",
  category: "get-started",
  order: 2,
  sections,
  relatedSlugs: ["get-started/overview", "get-started/quick-start"],
  lastUpdated: "2026-02-19",
});
