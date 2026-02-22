import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.cleanArchitecture.intro" },

      // ─── Architecture Layers ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.layersTitle", id: "layers" },
      {
            type: "table",
            headers: [
                  "commercial.cleanArchitecture.tblLayersHeader1",
                  "commercial.cleanArchitecture.tblLayersHeader2",
                  "commercial.cleanArchitecture.tblLayersHeader3"
            ],
            rows: [
                  ["commercial.cleanArchitecture.tblLayersR1C1", "commercial.cleanArchitecture.tblLayersR1C2", "commercial.cleanArchitecture.tblLayersR1C3"],
                  ["commercial.cleanArchitecture.tblLayersR2C1", "commercial.cleanArchitecture.tblLayersR2C2", "commercial.cleanArchitecture.tblLayersR2C3"],
                  ["commercial.cleanArchitecture.tblLayersR3C1", "commercial.cleanArchitecture.tblLayersR3C2", "commercial.cleanArchitecture.tblLayersR3C3"],
                  ["commercial.cleanArchitecture.tblLayersR4C1", "commercial.cleanArchitecture.tblLayersR4C2", "commercial.cleanArchitecture.tblLayersR4C3"],
            ],
      },

      // ─── CQRS Pattern ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.cleanArchitecture.cqrsTitle", id: "cqrs" },
      { type: "paragraph", contentKey: "commercial.cleanArchitecture.cqrsContent" },
      {
            type: "table",
            headers: [
                  "commercial.cleanArchitecture.tblCqrsHeader1",
                  "commercial.cleanArchitecture.tblCqrsHeader2",
                  "commercial.cleanArchitecture.tblCqrsHeader3"
            ],
            rows: [
                  ["commercial.cleanArchitecture.tblCqrsR1C1", "commercial.cleanArchitecture.tblCqrsR1C2", "commercial.cleanArchitecture.tblCqrsR1C3"],
                  ["commercial.cleanArchitecture.tblCqrsR2C1", "commercial.cleanArchitecture.tblCqrsR2C2", "commercial.cleanArchitecture.tblCqrsR2C3"],
                  ["commercial.cleanArchitecture.tblCqrsR3C1", "commercial.cleanArchitecture.tblCqrsR3C2", "commercial.cleanArchitecture.tblCqrsR3C3"],
                  ["commercial.cleanArchitecture.tblCqrsR4C1", "commercial.cleanArchitecture.tblCqrsR4C2", "commercial.cleanArchitecture.tblCqrsR4C3"],
                  ["commercial.cleanArchitecture.tblCqrsR5C1", "commercial.cleanArchitecture.tblCqrsR5C2", "commercial.cleanArchitecture.tblCqrsR5C3"],
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
            headers: [
                  "commercial.cleanArchitecture.tblBenHeader1",
                  "commercial.cleanArchitecture.tblBenHeader2"
            ],
            rows: [
                  ["commercial.cleanArchitecture.tblBenR1C1", "commercial.cleanArchitecture.tblBenR1C2"],
                  ["commercial.cleanArchitecture.tblBenR2C1", "commercial.cleanArchitecture.tblBenR2C2"],
                  ["commercial.cleanArchitecture.tblBenR3C1", "commercial.cleanArchitecture.tblBenR3C2"],
                  ["commercial.cleanArchitecture.tblBenR4C1", "commercial.cleanArchitecture.tblBenR4C2"],
                  ["commercial.cleanArchitecture.tblBenR5C1", "commercial.cleanArchitecture.tblBenR5C2"],
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
