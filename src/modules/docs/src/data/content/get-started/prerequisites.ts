import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "get-started/prerequisites",
  titleKey: "getStarted.prerequisites.title",
  category: "get-started",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.prerequisites.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.prerequisites.section_3_hdr_0",
      "getStarted.prerequisites.section_3_hdr_1",
      "getStarted.prerequisites.section_3_hdr_2",
      "getStarted.prerequisites.section_3_hdr_3"
    ],
    "rows": [
      [
        "getStarted.prerequisites.section_3_cell_0_0",
        "getStarted.prerequisites.section_3_cell_0_1",
        "getStarted.prerequisites.section_3_cell_0_2",
        "getStarted.prerequisites.section_3_cell_0_3"
      ],
      [
        "getStarted.prerequisites.section_3_cell_1_0",
        "getStarted.prerequisites.section_3_cell_1_1",
        "getStarted.prerequisites.section_3_cell_1_2",
        "getStarted.prerequisites.section_3_cell_1_3"
      ],
      [
        "getStarted.prerequisites.section_3_cell_2_0",
        "getStarted.prerequisites.section_3_cell_2_1",
        "getStarted.prerequisites.section_3_cell_2_2",
        "getStarted.prerequisites.section_3_cell_2_3"
      ],
      [
        "getStarted.prerequisites.section_3_cell_3_0",
        "getStarted.prerequisites.section_3_cell_3_1",
        "getStarted.prerequisites.section_3_cell_3_2",
        "getStarted.prerequisites.section_3_cell_3_3"
      ],
      [
        "getStarted.prerequisites.section_3_cell_4_0",
        "getStarted.prerequisites.section_3_cell_4_1",
        "getStarted.prerequisites.section_3_cell_4_2",
        "getStarted.prerequisites.section_3_cell_4_3"
      ],
      [
        "getStarted.prerequisites.section_3_cell_5_0",
        "getStarted.prerequisites.section_3_cell_5_1",
        "getStarted.prerequisites.section_3_cell_5_2",
        "getStarted.prerequisites.section_3_cell_5_3"
      ],
      [
        "getStarted.prerequisites.section_3_cell_6_0",
        "getStarted.prerequisites.section_3_cell_6_1",
        "getStarted.prerequisites.section_3_cell_6_2",
        "getStarted.prerequisites.section_3_cell_6_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.prerequisites.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_5_content"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.prerequisites.section_6_hdr_0",
      "getStarted.prerequisites.section_6_hdr_1",
      "getStarted.prerequisites.section_6_hdr_2",
      "getStarted.prerequisites.section_6_hdr_3"
    ],
    "rows": [
      [
        "getStarted.prerequisites.section_6_cell_0_0",
        "getStarted.prerequisites.section_6_cell_0_1",
        "getStarted.prerequisites.section_6_cell_0_2",
        "getStarted.prerequisites.section_6_cell_0_3"
      ],
      [
        "getStarted.prerequisites.section_6_cell_1_0",
        "getStarted.prerequisites.section_6_cell_1_1",
        "getStarted.prerequisites.section_6_cell_1_2",
        "getStarted.prerequisites.section_6_cell_1_3"
      ],
      [
        "getStarted.prerequisites.section_6_cell_2_0",
        "getStarted.prerequisites.section_6_cell_2_1",
        "getStarted.prerequisites.section_6_cell_2_2",
        "getStarted.prerequisites.section_6_cell_2_3"
      ],
      [
        "getStarted.prerequisites.section_6_cell_3_0",
        "getStarted.prerequisites.section_6_cell_3_1",
        "getStarted.prerequisites.section_6_cell_3_2",
        "getStarted.prerequisites.section_6_cell_3_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "getStarted.prerequisites.section_7_title",
    "contentKey": "getStarted.prerequisites.section_7_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.prerequisites.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.prerequisites.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_10_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_11_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "dotnet --version\nnode --version\npnpm --version",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.prerequisites.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_14_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_15_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "git clone https://github.com/seifmoustafa/SCRIPE.git\ncd SCRIPE\ngit submodule update --init --recursive",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.prerequisites.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_18_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_19_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// appsettings.Development.json\n{\n  \"ConnectionStrings\": {\n    \"DefaultConnection\": \"Server=localhost;Database=SCRIPE;Trusted_Connection=true;TrustServerCertificate=true;\"\n  },\n  \"DatabaseProvider\": \"SqlServer\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.prerequisites.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_22_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_23_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "cd SCRIPE-Backend\ndotnet restore\ndotnet ef database update -p src/Modules/Identity/Identity.Infrastructure -s src/Host/API",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "getStarted.prerequisites.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_26_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_27_content"
  },
  {
    "type": "code",
    "language": "bash",
    "code": "cd SCRIPE-Frontend\npnpm install\ncp .env.example .env.local",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.prerequisites.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.prerequisites.section_30_content"
  },
  {
    "type": "code",
    "language": "yaml",
    "code": "version: '3.8'\nservices:\n  scripe-db:\n    image: mcr.microsoft.com/mssql/server:2022-latest\n    environment:\n      ACCEPT_EULA: \"Y\"\n      SA_PASSWORD: \"YourStrong@Passw0rd\"\n    ports:\n      - \"1433:1433\"\n    volumes:\n      - scripe-data:/var/opt/mssql\n\n  scripe-redis:\n    image: redis:7-alpine\n    ports:\n      - \"6379:6379\"\n\n  scripe-api:\n    build:\n      context: ./SCRIPE-Backend\n      dockerfile: Dockerfile\n    environment:\n      ConnectionStrings__DefaultConnection: \"Server=scripe-db;Database=SCRIPE;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true\"\n      DatabaseProvider: \"SqlServer\"\n    ports:\n      - \"5000:5000\"\n    depends_on:\n      - scripe-db\n      - scripe-redis\n\nvolumes:\n  scripe-data:",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "getStarted.prerequisites.section_32_title",
    "contentKey": "getStarted.prerequisites.section_32_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.prerequisites.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "getStarted.prerequisites.section_34_item_0",
      "getStarted.prerequisites.section_34_item_1"
    ]
  }
],
  relatedSlugs: [
  "get-started/overview",
  "get-started/quick-start"
],
  lastUpdated: "2026-06-09",
});
