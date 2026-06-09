import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/compliance-reports",
  titleKey: "modules.compliance..reports.title",
  category: "modules",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..reports.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..reports.section_1_content"
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.compliance..reports.section_2_title",
    "contentKey": "modules.compliance..reports.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..reports.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "table",
    "headers": [],
    "rows": [
      [
        "modules.compliance..reports.section_4_cell_0_0",
        "modules.compliance..reports.section_4_cell_0_1",
        "modules.compliance..reports.section_4_cell_0_2"
      ],
      [
        "modules.compliance..reports.section_4_cell_1_0",
        "modules.compliance..reports.section_4_cell_1_1",
        "modules.compliance..reports.section_4_cell_1_2"
      ],
      [
        "modules.compliance..reports.section_4_cell_2_0",
        "modules.compliance..reports.section_4_cell_2_1",
        "modules.compliance..reports.section_4_cell_2_2"
      ],
      [
        "modules.compliance..reports.section_4_cell_3_0",
        "modules.compliance..reports.section_4_cell_3_1",
        "modules.compliance..reports.section_4_cell_3_2"
      ],
      [
        "modules.compliance..reports.section_4_cell_4_0",
        "modules.compliance..reports.section_4_cell_4_1",
        "modules.compliance..reports.section_4_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..reports.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..reports.section_6_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.compliance..reports.section_7_title",
    "contentKey": "modules.compliance..reports.section_7_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    queue([\"\"])\n    job{{\"\"}}\n    ready([\"\"])\n    download([\"\"])\n    queue --> job\n    job --> ready\n    ready --> download",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..reports.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.compliance..reports.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class GenerateReportCommandHandler : ICommandHandler<GenerateReportCommand, Guid>\n{\n    public async Task<Result<Guid>> Handle(GenerateReportCommand request, CancellationToken ct)\n    {\n        // 1. Create pending report record\n        var report = new ComplianceReport\n        {\n            TenantId = _tenantContext.TenantId,\n            ReportType = request.ReportType,\n            Title = $\"Compliance Report - {request.ReportType}\",\n            Status = ReportStatus.Pending\n        };\n        \n        await _repository.AddAsync(report, ct);\n        await _unitOfWork.SaveChangesAsync(ct);\n        \n        // 2. Queue background job\n        BackgroundJob.Enqueue<IReportGeneratorJob>(x => x.GenerateAsync(report.Id, ct));\n        \n        return Result<Guid>.Success(report.Id);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..reports.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "table",
    "headers": [
      "modules.compliance..reports.section_13_hdr_0",
      "modules.compliance..reports.section_13_hdr_1",
      "modules.compliance..reports.section_13_hdr_2",
      "modules.compliance..reports.section_13_hdr_3",
      "modules.compliance..reports.section_13_hdr_4"
    ],
    "rows": [
      [
        "modules.compliance..reports.section_13_cell_0_0",
        "modules.compliance..reports.section_13_cell_0_1",
        "modules.compliance..reports.section_13_cell_0_2",
        "modules.compliance..reports.section_13_cell_0_3",
        "modules.compliance..reports.section_13_cell_0_4"
      ],
      [
        "modules.compliance..reports.section_13_cell_1_0",
        "modules.compliance..reports.section_13_cell_1_1",
        "modules.compliance..reports.section_13_cell_1_2",
        "modules.compliance..reports.section_13_cell_1_3",
        "modules.compliance..reports.section_13_cell_1_4"
      ],
      [
        "modules.compliance..reports.section_13_cell_2_0",
        "modules.compliance..reports.section_13_cell_2_1",
        "modules.compliance..reports.section_13_cell_2_2",
        "modules.compliance..reports.section_13_cell_2_3",
        "modules.compliance..reports.section_13_cell_2_4"
      ],
      [
        "modules.compliance..reports.section_13_cell_3_0",
        "modules.compliance..reports.section_13_cell_3_1",
        "modules.compliance..reports.section_13_cell_3_2",
        "modules.compliance..reports.section_13_cell_3_3",
        "modules.compliance..reports.section_13_cell_3_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.compliance..reports.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.compliance..reports.section_15_item_0"
    ]
  }
],
  relatedSlugs: [
  "modules/compliance-overview"
],
  lastUpdated: "2026-06-09",
});
