import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/compliance-dsr",
  titleKey: "modules.compliance..dsr.title",
  category: "modules",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..dsr.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..dsr.section_1_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.compliance..dsr.section_2_title",
    "contentKey": "modules.compliance..dsr.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..dsr.section_4_content"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "modules.compliance..dsr.section_5_cell_0_0",
        "modules.compliance..dsr.section_5_cell_0_1",
        "modules.compliance..dsr.section_5_cell_0_2"
      ],
      [
        "modules.compliance..dsr.section_5_cell_1_0",
        "modules.compliance..dsr.section_5_cell_1_1",
        "modules.compliance..dsr.section_5_cell_1_2"
      ],
      [
        "modules.compliance..dsr.section_5_cell_2_0",
        "modules.compliance..dsr.section_5_cell_2_1",
        "modules.compliance..dsr.section_5_cell_2_2"
      ],
      [
        "modules.compliance..dsr.section_5_cell_3_0",
        "modules.compliance..dsr.section_5_cell_3_1",
        "modules.compliance..dsr.section_5_cell_3_2"
      ],
      [
        "modules.compliance..dsr.section_5_cell_4_0",
        "modules.compliance..dsr.section_5_cell_4_1",
        "modules.compliance..dsr.section_5_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..dsr.section_7_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    create([\"Submit Request\"])\n    %% create: Subject requests Export, Erasure, or Rectification\n    pending([\"Status: Pending\"])\n    %% pending: Request is logged, SLA deadline calculated\n    processing{{\"Status: Processing\"}}\n    %% processing: DsrExecutionJob begins processing modules via ISuspendableModule\n    approval[\"Wait For Admin\"]\n    %% approval: Nuclear actions (Erasure) require manual admin confirmation\n    completed([\"Status: Completed\"])\n    %% completed: Export generated or data erased; SLA fulfilled\n    rejected[\"Status: Rejected\"]\n    %% rejected: Request denied by admin with resolution notes\n    create -->|\"initiates\"| pending\n    pending -->|\"background job picks up\"| processing\n    processing -->|\"if auto-processed (Export)\"| completed\n    processing -->|\"if nuclear (Erasure)\"| approval\n    approval -->|\"admin confirms\"| completed\n    approval -->|\"admin rejects\"| rejected",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "modules.compliance..dsr.section_10_title",
    "contentKey": "modules.compliance..dsr.section_10_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..dsr.section_12_hdr_0"
    ],
    "rows": [
      [
        "modules.compliance..dsr.section_12_cell_0_0",
        "modules.compliance..dsr.section_12_cell_0_1",
        "modules.compliance..dsr.section_12_cell_0_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_1_0",
        "modules.compliance..dsr.section_12_cell_1_1",
        "modules.compliance..dsr.section_12_cell_1_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_2_0",
        "modules.compliance..dsr.section_12_cell_2_1",
        "modules.compliance..dsr.section_12_cell_2_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_3_0",
        "modules.compliance..dsr.section_12_cell_3_1",
        "modules.compliance..dsr.section_12_cell_3_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_4_0",
        "modules.compliance..dsr.section_12_cell_4_1",
        "modules.compliance..dsr.section_12_cell_4_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_5_0",
        "modules.compliance..dsr.section_12_cell_5_1",
        "modules.compliance..dsr.section_12_cell_5_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_6_0",
        "modules.compliance..dsr.section_12_cell_6_1",
        "modules.compliance..dsr.section_12_cell_6_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_7_0",
        "modules.compliance..dsr.section_12_cell_7_1",
        "modules.compliance..dsr.section_12_cell_7_2"
      ],
      [
        "modules.compliance..dsr.section_12_cell_8_0",
        "modules.compliance..dsr.section_12_cell_8_1",
        "modules.compliance..dsr.section_12_cell_8_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..dsr.section_14_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class SubmitDsrCommandHandler : ICommandHandler<SubmitDsrCommand, Guid>\n{\n    public async Task<Result<Guid>> Handle(SubmitDsrCommand request, CancellationToken ct)\n    {\n        // 1. Calculate SLA deadline based on regulation profile\n        var regulation = await _regulationRepo.GetByCodeAsync(request.RegulationCode, ct);\n        var deadline = DateTime.UtcNow.AddDays(regulation.ResponseSlaDays);\n        \n        // 2. Create the entity\n        var dsr = new DataSubjectRequest\n        {\n            TenantId = _tenantContext.TenantId,\n            SubjectEmail = request.SubjectEmail,\n            RequestType = request.RequestType,\n            RegulationCode = request.RegulationCode,\n            Status = DsrStatus.Pending,\n            Deadline = deadline\n        };\n        \n        await _repository.AddAsync(dsr, ct);\n        await _unitOfWork.SaveChangesAsync(ct);\n        \n        // 3. Domain event triggers webhook\n        dsr.AddDomainEvent(new DsrSubmittedEvent(dsr.Id));\n        \n        return Result<Guid>.Success(dsr.Id);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.compliance..dsr.section_17_title",
    "contentKey": "modules.compliance..dsr.section_17_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..dsr.section_19_hdr_0",
      "modules.compliance..dsr.section_19_hdr_1",
      "modules.compliance..dsr.section_19_hdr_2",
      "modules.compliance..dsr.section_19_hdr_3",
      "modules.compliance..dsr.section_19_hdr_4"
    ],
    "rows": [
      [
        "modules.compliance..dsr.section_19_cell_0_0",
        "modules.compliance..dsr.section_19_cell_0_1",
        "modules.compliance..dsr.section_19_cell_0_2",
        "modules.compliance..dsr.section_19_cell_0_3",
        "modules.compliance..dsr.section_19_cell_0_4"
      ],
      [
        "modules.compliance..dsr.section_19_cell_1_0",
        "modules.compliance..dsr.section_19_cell_1_1",
        "modules.compliance..dsr.section_19_cell_1_2",
        "modules.compliance..dsr.section_19_cell_1_3",
        "modules.compliance..dsr.section_19_cell_1_4"
      ],
      [
        "modules.compliance..dsr.section_19_cell_2_0",
        "modules.compliance..dsr.section_19_cell_2_1",
        "modules.compliance..dsr.section_19_cell_2_2",
        "modules.compliance..dsr.section_19_cell_2_3",
        "modules.compliance..dsr.section_19_cell_2_4"
      ],
      [
        "modules.compliance..dsr.section_19_cell_3_0",
        "modules.compliance..dsr.section_19_cell_3_1",
        "modules.compliance..dsr.section_19_cell_3_2",
        "modules.compliance..dsr.section_19_cell_3_3",
        "modules.compliance..dsr.section_19_cell_3_4"
      ],
      [
        "modules.compliance..dsr.section_19_cell_4_0",
        "modules.compliance..dsr.section_19_cell_4_1",
        "modules.compliance..dsr.section_19_cell_4_2",
        "modules.compliance..dsr.section_19_cell_4_3",
        "modules.compliance..dsr.section_19_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..dsr.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..dsr.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "code",
    "language": "json",
    "code": "POST /api/v1/compliance/dsr\n{\n  \"requestType\": \"Export\",\n  \"regulationCode\": \"GDPR\",\n  \"subjectEmail\": \"user@example.com\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.compliance..dsr.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..dsr.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.compliance..dsr.section_26_item_0",
      "modules.compliance..dsr.section_26_item_1"
    ]
  }
],
  relatedSlugs: [
  "modules/compliance-overview",
  "infrastructure/background-jobs"
],
  lastUpdated: "2026-06-09",
});
