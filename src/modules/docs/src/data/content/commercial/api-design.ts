import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "commercial/api-design",
  titleKey: "commercial.apiDesign.title",
  category: "commercial-developer",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "commercial.apiDesign.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.apiDesign.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.apiDesign.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "commercial.apiDesign.section_3_hdr_0",
      "commercial.apiDesign.section_3_hdr_1",
      "commercial.apiDesign.section_3_hdr_2"
    ],
    "rows": [
      [
        "commercial.apiDesign.section_3_cell_0_0",
        "commercial.apiDesign.section_3_cell_0_1",
        "commercial.apiDesign.section_3_cell_0_2"
      ],
      [
        "commercial.apiDesign.section_3_cell_1_0",
        "commercial.apiDesign.section_3_cell_1_1",
        "commercial.apiDesign.section_3_cell_1_2"
      ],
      [
        "commercial.apiDesign.section_3_cell_2_0",
        "commercial.apiDesign.section_3_cell_2_1",
        "commercial.apiDesign.section_3_cell_2_2"
      ],
      [
        "commercial.apiDesign.section_3_cell_3_0",
        "commercial.apiDesign.section_3_cell_3_1",
        "commercial.apiDesign.section_3_cell_3_2"
      ],
      [
        "commercial.apiDesign.section_3_cell_4_0",
        "commercial.apiDesign.section_3_cell_4_1",
        "commercial.apiDesign.section_3_cell_4_2"
      ],
      [
        "commercial.apiDesign.section_3_cell_5_0",
        "commercial.apiDesign.section_3_cell_5_1",
        "commercial.apiDesign.section_3_cell_5_2"
      ],
      [
        "commercial.apiDesign.section_3_cell_6_0",
        "commercial.apiDesign.section_3_cell_6_1",
        "commercial.apiDesign.section_3_cell_6_2"
      ],
      [
        "commercial.apiDesign.section_3_cell_7_0",
        "commercial.apiDesign.section_3_cell_7_1",
        "commercial.apiDesign.section_3_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.apiDesign.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.apiDesign.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.apiDesign.section_6_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Every handler returns Result<T>\npublic async Task<Result<EmployeeDto>> Handle(CreateEmployeeCommand cmd)\n{\n    // Validation happens in pipeline behavior (FluentValidation)\n    \n    var employee = Employee.Create(cmd.Name, cmd.Email);\n    await _repository.AddAsync(employee);\n    await _unitOfWork.SaveChangesAsync();\n    \n    return Result<EmployeeDto>.Success(_mapper.Map(employee));\n}\n\n// Controller auto-maps Result to HTTP response\n// Result.Success → 200 OK\n// Result.Failure → 400 Bad Request  \n// Result.NotFound → 404 Not Found\n// Result.Forbidden → 403 Forbidden",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.apiDesign.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "table",
    "headers": [
      "commercial.apiDesign.section_9_hdr_0",
      "commercial.apiDesign.section_9_hdr_1",
      "commercial.apiDesign.section_9_hdr_2"
    ],
    "rows": [
      [
        "commercial.apiDesign.section_9_cell_0_0",
        "commercial.apiDesign.section_9_cell_0_1",
        "commercial.apiDesign.section_9_cell_0_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_1_0",
        "commercial.apiDesign.section_9_cell_1_1",
        "commercial.apiDesign.section_9_cell_1_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_2_0",
        "commercial.apiDesign.section_9_cell_2_1",
        "commercial.apiDesign.section_9_cell_2_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_3_0",
        "commercial.apiDesign.section_9_cell_3_1",
        "commercial.apiDesign.section_9_cell_3_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_4_0",
        "commercial.apiDesign.section_9_cell_4_1",
        "commercial.apiDesign.section_9_cell_4_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_5_0",
        "commercial.apiDesign.section_9_cell_5_1",
        "commercial.apiDesign.section_9_cell_5_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_6_0",
        "commercial.apiDesign.section_9_cell_6_1",
        "commercial.apiDesign.section_9_cell_6_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_7_0",
        "commercial.apiDesign.section_9_cell_7_1",
        "commercial.apiDesign.section_9_cell_7_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_8_0",
        "commercial.apiDesign.section_9_cell_8_1",
        "commercial.apiDesign.section_9_cell_8_2"
      ],
      [
        "commercial.apiDesign.section_9_cell_9_0",
        "commercial.apiDesign.section_9_cell_9_1",
        "commercial.apiDesign.section_9_cell_9_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.apiDesign.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.apiDesign.section_11_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"isSuccess\": false,\n  \"statusCode\": 400,\n  \"message\": \"Validation failed\",\n  \"errors\": [\n    { \"field\": \"email\", \"message\": \"Email is already in use\" },\n    { \"field\": \"name\", \"message\": \"Name must be at least 2 characters\" }\n  ],\n  \"traceId\": \"abc-123-def\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.apiDesign.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.apiDesign.section_14_content"
  },
  {
    "type": "list",
    "variant": "ordered",
    "items": [
      "commercial.apiDesign.section_15_item_0",
      "commercial.apiDesign.section_15_item_1",
      "commercial.apiDesign.section_15_item_2",
      "commercial.apiDesign.section_15_item_3",
      "commercial.apiDesign.section_15_item_4",
      "commercial.apiDesign.section_15_item_5",
      "commercial.apiDesign.section_15_item_6"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.apiDesign.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "commercial.apiDesign.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "commercial.apiDesign.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "commercial.apiDesign.section_19_item_0",
      "commercial.apiDesign.section_19_item_1"
    ]
  }
],
  relatedSlugs: [
  "commercial/clean-architecture",
  "commercial/rest-api-overview"
],
  lastUpdated: "2026-06-09",
});
