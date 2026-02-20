import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.cleanArchitecture.intro" },

      // ─── Architecture Layers ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.layersTitle", id: "layers" },
      {
            type: "table",
            headers: ["Layer", "Responsibility", "Dependencies"],
            rows: [
                  ["Domain", "Entities, value objects, domain events, specifications", "None (pure C#)"],
                  ["Application", "Commands, queries, validators, behaviors", "Domain only"],
                  ["Infrastructure", "Repositories, EF Core, external services", "Domain + Application"],
                  ["Presentation", "Controllers, middleware, API endpoints", "Application"],
            ],
      },

      // ─── CQRS Pattern ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.cqrsTitle", id: "cqrs" },
      { type: "paragraph", contentKey: "commercial.cleanArchitecture.cqrsContent" },
      {
            type: "table",
            headers: ["Component", "Purpose", "Example"],
            rows: [
                  ["Command", "Write operation (create, update, delete)", "CreateUserCommand"],
                  ["Query", "Read operation (list, detail, search)", "GetUsersQuery"],
                  ["Handler", "Business logic execution", "CreateUserCommandHandler"],
                  ["Validator", "Input validation (FluentValidation)", "CreateUserValidator"],
                  ["Behavior", "Cross-cutting (logging, validation, caching)", "ValidationBehavior<T>"],
            ],
      },

      // ─── SOLID Principles ──────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.solidTitle", id: "solid" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "layers", titleKey: "commercial.cleanArchitecture.singleResp", descriptionKey: "commercial.cleanArchitecture.singleRespDesc" },
                  { icon: "zap", titleKey: "commercial.cleanArchitecture.openClosed", descriptionKey: "commercial.cleanArchitecture.openClosedDesc" },
                  { icon: "shield", titleKey: "commercial.cleanArchitecture.depInversion", descriptionKey: "commercial.cleanArchitecture.depInversionDesc" },
                  { icon: "building", titleKey: "commercial.cleanArchitecture.interfaceSeg", descriptionKey: "commercial.cleanArchitecture.interfaceSegDesc" },
            ],
      },

      // ─── Domain-Driven Design ───────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.dddTitle", id: "ddd" },
      { type: "paragraph", contentKey: "commercial.cleanArchitecture.dddContent" },

      // ─── Frontend SOLID ─────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.frontendTitle", id: "frontend-solid" },
      { type: "paragraph", contentKey: "commercial.cleanArchitecture.frontendContent" },
      {
            type: "code",
            language: "typescript",
            filename: "SOLID View/ViewModel Pattern",
            code: `// View — Pure UI (~60 lines, zero logic)
export function EmployeeListView() {
  const vm = useEmployeeListViewModel();
  return (
    <div>
      <FilterSection {...vm.filters} />
      <StatisticsSection {...vm.statistics} />
      <GenericCrudView crud={vm.table} columns={vm.columns} />
    </div>
  );
}

// ViewModel — All Logic (composing section ViewModels)
export function useEmployeeListViewModel() {
  const filters = useFilterViewModel();
  const statistics = useStatisticsViewModel();
  const table = useCrudViewModel(config);
  const columns = [...]; // Defined here, not in View
  return { filters, statistics, table, columns };
}`,
      },

      // ─── Benefits ───────────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.benefitsTitle", id: "benefits" },
      {
            type: "table",
            headers: ["Benefit", "Impact"],
            rows: [
                  ["Testability", "Each layer testable in isolation, 80%+ coverage achievable"],
                  ["Maintainability", "Changes to one layer don't cascade to others"],
                  ["Scalability", "Easily extract modules to microservices"],
                  ["Onboarding", "New developers understand structure immediately"],
                  ["Flexibility", "Swap database, framework, or UI independently"],
            ],
      },
];

registerPage({
      slug: "commercial/clean-architecture",
      titleKey: "commercial.cleanArchitecture.title",
      descriptionKey: "commercial.cleanArchitecture.description",
      category: "commercial-developer",
      order: 2,
      sections,
      relatedSlugs: ["commercial/cli-tooling", "commercial/api-design"],
      lastUpdated: "2026-02-20",
});
