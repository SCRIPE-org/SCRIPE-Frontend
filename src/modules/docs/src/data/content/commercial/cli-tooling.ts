import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.cliTooling.intro" },

      // ─── Available Commands ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cliTooling.commandsTitle", id: "commands" },
      {
            type: "table",
            headers: ["commercial.cliTooling.tblCmdHeader1", "commercial.cliTooling.tblCmdHeader2", "commercial.cliTooling.tblCmdHeader3"],
            rows: [
                  ["Module", "commercial.cliTooling.descMod", "pnpm run cli module new HR"],
                  ["Entity", "commercial.cliTooling.descEnt", "pnpm run cli entity new HR Employee"],
                  ["Command", "commercial.cliTooling.descCmd", "pnpm run cli command new HR CreateEmployee"],
                  ["Query", "commercial.cliTooling.descQry", "pnpm run cli query new HR GetEmployees"],
                  ["Migration", "commercial.cliTooling.descMig", "pnpm run cli db migrations add HR Initial"],
                  ["Dev", "commercial.cliTooling.descDev", "pnpm run dev"],
            ],
      },

      // ─── Scaffold Output ────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cliTooling.scaffoldTitle", id: "scaffolding" },
      { type: "paragraph", contentKey: "commercial.cliTooling.scaffoldContent" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.cliTooling.step1Title", contentKey: "commercial.cliTooling.step1Content" },
                  { titleKey: "commercial.cliTooling.step2Title", contentKey: "commercial.cliTooling.step2Content" },
                  { titleKey: "commercial.cliTooling.step3Title", contentKey: "commercial.cliTooling.step3Content" },
                  { titleKey: "commercial.cliTooling.step4Title", contentKey: "commercial.cliTooling.step4Content" },
            ],
      },
      {
            type: "code",
            language: "bash",
            filename: "Continuous Deterministic Delivery (CDD)",
            code: `$ pnpm run cli module new EnterpriseBilling

[SYS] Booting Deterministic Scaffolding Engine...
[SYS] Compiling 66 Handlebars Execution Matrices...

✓ Created Domain Layer [EnterpriseBilling.Domain]
  → Aggregates/BillingAccount.cs
  → ValueObjects/Currency.cs
  → Events/InvoiceGeneratedDomainEvent.cs
  
✓ Created Application Layer [EnterpriseBilling.Application]
  → Commands/GenerateInvoice/GenerateInvoiceCommand.cs
  → Commands/GenerateInvoice/GenerateInvoiceValidator.cs (FluentValidation)
  → Queries/GetAccountLedger/GetAccountLedgerQuery.cs
  
✓ Created Infrastructure Layer [EnterpriseBilling.Infrastructure]
  → Persistence/BillingAccountConfiguration.cs (EF Core)
  → Persistence/BillingAccountRepository.cs
  → Security/BillingPermissionSeeder.cs (RBAC Injection)

✓ Created Presentation Layer [EnterpriseBilling.Presentation]
  → Controllers/BillingController.cs (JWT Secured)
  
✓ Created Next.js Frontend [EnterpriseBilling.UI]
  → domain/entities/BillingAccount.ts (Zod Schema)
  → presentation/viewmodels/useBillingViewModel.ts (TanStack Query)
  → presentation/views/BillingDashboardView.tsx (Tailwind UI)
  
[VERIFY] Mathematical Clean Architecture Conformance: PASSED
[READY] Successfully generated 18 immutable artifacts in 0.8s.`,
      },

      // ─── What Gets Generated ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cliTooling.generatedTitle", id: "generated" },
      {
            type: "table",
            headers: ["commercial.cliTooling.hdrLayer", "commercial.cliTooling.hdrFiles", "commercial.cliTooling.hdrIncs"],
            rows: [
                  ["commercial.cliTooling.layerDomain", "commercial.cliTooling.layerDomainFiles", "commercial.cliTooling.layerDomainIncs"],
                  ["commercial.cliTooling.layerApp", "commercial.cliTooling.layerAppFiles", "commercial.cliTooling.layerAppIncs"],
                  ["commercial.cliTooling.layerInfra", "commercial.cliTooling.layerInfraFiles", "commercial.cliTooling.layerInfraIncs"],
                  ["commercial.cliTooling.layerFront", "commercial.cliTooling.layerFrontFiles", "commercial.cliTooling.layerFrontIncs"],
                  ["commercial.cliTooling.layerRoute", "commercial.cliTooling.layerRouteFiles", "commercial.cliTooling.layerRouteIncs"],
            ],
      },

      // ─── Customization ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cliTooling.customizeTitle", id: "customize" },
      { type: "paragraph", contentKey: "commercial.cliTooling.customizeContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "commercial.cliTooling.itemHbs",
                  "commercial.cliTooling.itemArch",
                  "commercial.cliTooling.itemBoil",
                  "commercial.cliTooling.itemSec",
                  "commercial.cliTooling.itemConfig",
            ],
      },
];

registerPage({
      slug: "commercial/cli-tooling",
      titleKey: "commercial.cliTooling.title",
      descriptionKey: "commercial.cliTooling.description",
      category: "commercial-developer",
      order: 1,
      sections,
      relatedSlugs: ["commercial/clean-architecture", "commercial/api-design"],
      lastUpdated: "2026-02-20",
});
