import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/storage-backends",
  titleKey: "commercial.storageBackends.title",
  category: "commercial-technical",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.storageBackends.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "commercial.storageBackends.section_4_hdr_0",
      "commercial.storageBackends.section_4_hdr_1",
      "commercial.storageBackends.section_4_hdr_2",
      "commercial.storageBackends.section_4_hdr_3"
    ],
    "rows": [
      [
        "commercial.storageBackends.section_4_cell_0_0",
        "commercial.storageBackends.section_4_cell_0_1",
        "commercial.storageBackends.section_4_cell_0_2",
        "commercial.storageBackends.section_4_cell_0_3"
      ],
      [
        "commercial.storageBackends.section_4_cell_1_0",
        "commercial.storageBackends.section_4_cell_1_1",
        "commercial.storageBackends.section_4_cell_1_2",
        "commercial.storageBackends.section_4_cell_1_3"
      ],
      [
        "commercial.storageBackends.section_4_cell_2_0",
        "commercial.storageBackends.section_4_cell_2_1",
        "commercial.storageBackends.section_4_cell_2_2",
        "commercial.storageBackends.section_4_cell_2_3"
      ],
      [
        "commercial.storageBackends.section_4_cell_3_0",
        "commercial.storageBackends.section_4_cell_3_1",
        "commercial.storageBackends.section_4_cell_3_2",
        "commercial.storageBackends.section_4_cell_3_3"
      ],
      [
        "commercial.storageBackends.section_4_cell_4_0",
        "commercial.storageBackends.section_4_cell_4_1",
        "commercial.storageBackends.section_4_cell_4_2",
        "commercial.storageBackends.section_4_cell_4_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.storageBackends.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.storageBackends.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.storageBackends.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_9_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.storageBackends.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_11_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.storageBackends.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_13_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.storageBackends.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "table",
    "headers": [
      "commercial.storageBackends.section_15_hdr_0",
      "commercial.storageBackends.section_15_hdr_1",
      "commercial.storageBackends.section_15_hdr_2"
    ],
    "rows": [
      [
        "commercial.storageBackends.section_15_cell_0_0",
        "commercial.storageBackends.section_15_cell_0_1",
        "commercial.storageBackends.section_15_cell_0_2"
      ],
      [
        "commercial.storageBackends.section_15_cell_1_0",
        "commercial.storageBackends.section_15_cell_1_1",
        "commercial.storageBackends.section_15_cell_1_2"
      ],
      [
        "commercial.storageBackends.section_15_cell_2_0",
        "commercial.storageBackends.section_15_cell_2_1",
        "commercial.storageBackends.section_15_cell_2_2"
      ],
      [
        "commercial.storageBackends.section_15_cell_3_0",
        "commercial.storageBackends.section_15_cell_3_1",
        "commercial.storageBackends.section_15_cell_3_2"
      ],
      [
        "commercial.storageBackends.section_15_cell_4_0",
        "commercial.storageBackends.section_15_cell_4_1",
        "commercial.storageBackends.section_15_cell_4_2"
      ],
      [
        "commercial.storageBackends.section_15_cell_5_0",
        "commercial.storageBackends.section_15_cell_5_1",
        "commercial.storageBackends.section_15_cell_5_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.storageBackends.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_17_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"StorageSettings\": {\n    \"Provider\": \"azure\",\n    \"MaxFileSizeMB\": 50,\n    \"AllowedExtensions\": [\".pdf\", \".docx\", \".png\", \".jpg\", \".xlsx\"],\n    \"Azure\": {\n      \"ConnectionString\": \"DefaultEndpointsProtocol=https;...\",\n      \"ContainerName\": \"scripe-files\"\n    },\n    \"S3\": {\n      \"AccessKey\": \"...\",\n      \"SecretKey\": \"...\",\n      \"BucketName\": \"scripe-files\",\n      \"Region\": \"us-east-1\"\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.storageBackends.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_20_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.storageBackends.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_22_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.storageBackends.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_24_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "commercial.storageBackends.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.storageBackends.section_26_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.storageBackends.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.storageBackends.section_28_item_0",
      "commercial.storageBackends.section_28_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/database-support",
  "commercial/resilience-patterns"
],
  lastUpdated: "2026-06-09",
});
