import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/data-flow",
  titleKey: "architecture.dataFlow.title",
  category: "architecture",
  order: 8,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.dataFlow.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dataFlow.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dataFlow.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dataFlow.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    view([\"View (UI)\"])\n    vm([\"ViewModel\"])\n    tq([\"TanStack Query\"])\n    repo{{\"Repository\"}}\n    api[\"API Service\"]\n    backend[\"Backend API\"]\n    view -->|\"uses hook\"| vm\n    vm -->|\"useQuery\"| tq\n    tq -->|\"queryFn\"| repo\n    repo -->|\"GET\"| api\n    api -->|\"HTTP\"| backend",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dataFlow.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    action[\"User Action\"]\n    vm2([\"ViewModel\"])\n    mutation([\"useMutation\"])\n    repo2{{\"Repository\"}}\n    api2[\"POST/PUT/DELETE\"]\n    invalidate([\"Invalidate Queries\"])\n    action -->|\"onClick\"| vm2\n    vm2 -->|\"mutate()\"| mutation\n    mutation -->|\"mutationFn\"| repo2\n    repo2 -->|\"HTTP\"| api2\n    api2 -->|\"onSuccess\"| invalidate",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dataFlow.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dataFlow.section_8_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    http[\"HTTP Request\"]\n    cors2([\"CORS Middleware\"])\n    rate{{\"Rate Limiter\"}}\n    auth2([\"JWT Authentication\"])\n    authz2([\"Authorization\"])\n    reqlog([\"Request Logger\"])\n    ctrl([\"Controller → AstraFlow mediator.Send()\"])\n    val{{\"ValidationBehavior\"}}\n    featcheck[\"FeatureCheckBehavior\"]\n    cache([\"CachingBehavior\"])\n    handler2([\"Handler → Repository → DbContext\"])\n    resp([\"Result<T> → JSON Response\"])\n    http --> cors2\n    cors2 --> rate\n    rate --> auth2\n    auth2 --> authz2\n    authz2 --> reqlog\n    reqlog --> ctrl\n    ctrl --> val\n    val --> featcheck\n    featcheck --> cache\n    cache --> handler2\n    handler2 --> resp",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dataFlow.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dataFlow.section_11_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.dataFlow.section_12_hdr_0",
      "architecture.dataFlow.section_12_hdr_1",
      "architecture.dataFlow.section_12_hdr_2",
      "architecture.dataFlow.section_12_hdr_3"
    ],
    "rows": [
      [
        "architecture.dataFlow.section_12_cell_0_0",
        "architecture.dataFlow.section_12_cell_0_1",
        "architecture.dataFlow.section_12_cell_0_2",
        "architecture.dataFlow.section_12_cell_0_3"
      ],
      [
        "architecture.dataFlow.section_12_cell_1_0",
        "architecture.dataFlow.section_12_cell_1_1",
        "architecture.dataFlow.section_12_cell_1_2",
        "architecture.dataFlow.section_12_cell_1_3"
      ],
      [
        "architecture.dataFlow.section_12_cell_2_0",
        "architecture.dataFlow.section_12_cell_2_1",
        "architecture.dataFlow.section_12_cell_2_2",
        "architecture.dataFlow.section_12_cell_2_3"
      ],
      [
        "architecture.dataFlow.section_12_cell_3_0",
        "architecture.dataFlow.section_12_cell_3_1",
        "architecture.dataFlow.section_12_cell_3_2",
        "architecture.dataFlow.section_12_cell_3_3"
      ],
      [
        "architecture.dataFlow.section_12_cell_4_0",
        "architecture.dataFlow.section_12_cell_4_1",
        "architecture.dataFlow.section_12_cell_4_2",
        "architecture.dataFlow.section_12_cell_4_3"
      ],
      [
        "architecture.dataFlow.section_12_cell_5_0",
        "architecture.dataFlow.section_12_cell_5_1",
        "architecture.dataFlow.section_12_cell_5_2",
        "architecture.dataFlow.section_12_cell_5_3"
      ],
      [
        "architecture.dataFlow.section_12_cell_6_0",
        "architecture.dataFlow.section_12_cell_6_1",
        "architecture.dataFlow.section_12_cell_6_2",
        "architecture.dataFlow.section_12_cell_6_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dataFlow.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.dataFlow.section_14_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    req2[\"Query Request\"]\n    l1([\"L1: IMemoryCache (in-process)\"])\n    l2([\"L2: Redis (distributed)\"])\n    db[\"Database Query\"]\n    store([\"Store in L1 + L2\"])\n    req2 -->|\"Check L1\"| l1\n    l1 -->|\"Miss → Check L2\"| l2\n    l2 -->|\"Miss → Query DB\"| db\n    db -->|\"Cache result\"| store",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "architecture.dataFlow.section_16_title",
    "contentKey": "architecture.dataFlow.section_16_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.dataFlow.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.dataFlow.section_18_item_0",
      "architecture.dataFlow.section_18_item_1"
    ]
  }
],
  relatedSlugs: [
  "architecture/cqrs",
  "architecture/backend"
],
  lastUpdated: "2026-06-09",
});
