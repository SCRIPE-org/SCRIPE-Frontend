import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/clean-architecture",
  titleKey: "commercial.cleanArchitecture.title",
  category: "commercial-developer",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.cleanArchitecture.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.cleanArchitecture.section_3_hdr_0",
      "commercial.cleanArchitecture.section_3_hdr_1",
      "commercial.cleanArchitecture.section_3_hdr_2"
    ],
    "rows": [
      [
        "commercial.cleanArchitecture.section_3_cell_0_0",
        "commercial.cleanArchitecture.section_3_cell_0_1",
        "commercial.cleanArchitecture.section_3_cell_0_2"
      ],
      [
        "commercial.cleanArchitecture.section_3_cell_1_0",
        "commercial.cleanArchitecture.section_3_cell_1_1",
        "commercial.cleanArchitecture.section_3_cell_1_2"
      ],
      [
        "commercial.cleanArchitecture.section_3_cell_2_0",
        "commercial.cleanArchitecture.section_3_cell_2_1",
        "commercial.cleanArchitecture.section_3_cell_2_2"
      ],
      [
        "commercial.cleanArchitecture.section_3_cell_3_0",
        "commercial.cleanArchitecture.section_3_cell_3_1",
        "commercial.cleanArchitecture.section_3_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.cleanArchitecture.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_5_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.cleanArchitecture.section_6_hdr_0",
      "commercial.cleanArchitecture.section_6_hdr_1",
      "commercial.cleanArchitecture.section_6_hdr_2"
    ],
    "rows": [
      [
        "commercial.cleanArchitecture.section_6_cell_0_0",
        "commercial.cleanArchitecture.section_6_cell_0_1",
        "commercial.cleanArchitecture.section_6_cell_0_2"
      ],
      [
        "commercial.cleanArchitecture.section_6_cell_1_0",
        "commercial.cleanArchitecture.section_6_cell_1_1",
        "commercial.cleanArchitecture.section_6_cell_1_2"
      ],
      [
        "commercial.cleanArchitecture.section_6_cell_2_0",
        "commercial.cleanArchitecture.section_6_cell_2_1",
        "commercial.cleanArchitecture.section_6_cell_2_2"
      ],
      [
        "commercial.cleanArchitecture.section_6_cell_3_0",
        "commercial.cleanArchitecture.section_6_cell_3_1",
        "commercial.cleanArchitecture.section_6_cell_3_2"
      ],
      [
        "commercial.cleanArchitecture.section_6_cell_4_0",
        "commercial.cleanArchitecture.section_6_cell_4_1",
        "commercial.cleanArchitecture.section_6_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.cleanArchitecture.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.cleanArchitecture.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.cleanArchitecture.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.cleanArchitecture.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_13_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.cleanArchitecture.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.cleanArchitecture.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.cleanArchitecture.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_19_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.cleanArchitecture.section_20_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// View — Pure UI (~60 lines, zero logic)\nexport function EmployeeListView() {\n  const vm = useEmployeeListViewModel();\n  return (\n    <div>\n      <FilterSection {...vm.filters} />\n      <StatisticsSection {...vm.statistics} />\n      <GenericCrudView crud={vm.table} columns={vm.columns} />\n    </div>\n  );\n}\n\n// ViewModel — All Logic (composing section ViewModels)\nexport function useEmployeeListViewModel() {\n  const filters = useFilterViewModel();\n  const statistics = useStatisticsViewModel();\n  const table = useCrudViewModel(config);\n  const columns = [...]; // Defined here, not in View\n  return { filters, statistics, table, columns };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.cleanArchitecture.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "table",
    "headers": [
      "commercial.cleanArchitecture.section_23_hdr_0",
      "commercial.cleanArchitecture.section_23_hdr_1"
    ],
    "rows": [
      [
        "commercial.cleanArchitecture.section_23_cell_0_0",
        "commercial.cleanArchitecture.section_23_cell_0_1"
      ],
      [
        "commercial.cleanArchitecture.section_23_cell_1_0",
        "commercial.cleanArchitecture.section_23_cell_1_1"
      ],
      [
        "commercial.cleanArchitecture.section_23_cell_2_0",
        "commercial.cleanArchitecture.section_23_cell_2_1"
      ],
      [
        "commercial.cleanArchitecture.section_23_cell_3_0",
        "commercial.cleanArchitecture.section_23_cell_3_1"
      ],
      [
        "commercial.cleanArchitecture.section_23_cell_4_0",
        "commercial.cleanArchitecture.section_23_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.cleanArchitecture.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.cleanArchitecture.section_25_item_0",
      "commercial.cleanArchitecture.section_25_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/cli-tooling",
  "commercial/api-design"
],
  lastUpdated: "2026-06-09",
});
