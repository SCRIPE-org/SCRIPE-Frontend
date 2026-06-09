import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/stripe-connect",
  titleKey: "modules.stripeConnect.title",
  category: "modules",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.stripeConnect.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_3_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.stripeConnect.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_5_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.stripeConnect.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.stripeConnect.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_9_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.stripeConnect.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_12_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class PlatformCommission : AuditableEntity\n{\n    public Guid TenantId { get; set; }\n    public decimal Percentage { get; set; }\n    public decimal FixedFee { get; set; }\n    public string Currency { get; set; } = \"USD\";\n    public bool IsActive { get; set; } = true;\n}\n\npublic class CommissionLedgerEntry : AuditableEntity\n{\n    public Guid TenantId { get; set; }\n    public decimal TransactionAmount { get; set; }\n    public decimal CommissionAmount { get; set; }\n    public string Currency { get; set; } = \"USD\";\n    public string ReferenceType { get; set; } = string.Empty;\n    public string ReferenceId { get; set; } = string.Empty;\n    public LedgerStatus Status { get; set; } = LedgerStatus.Pending;\n}\n\npublic class CommissionInvoice : AuditableEntity\n{\n    public Guid TenantId { get; set; }\n    public decimal TotalAmount { get; set; }\n    public string Currency { get; set; } = \"USD\";\n    public DateTime BillingPeriodStart { get; set; }\n    public DateTime BillingPeriodEnd { get; set; }\n    public CommissionInvoiceStatus Status { get; set; } = CommissionInvoiceStatus.Unpaid;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.stripeConnect.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.stripeConnect.section_15_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.stripeConnect.section_16_hdr_0",
      "modules.stripeConnect.section_16_hdr_1",
      "modules.stripeConnect.section_16_hdr_2",
      "modules.stripeConnect.section_16_hdr_3",
      "modules.stripeConnect.section_16_hdr_4"
    ],
    "rows": [
      [
        "modules.stripeConnect.section_16_cell_0_0",
        "modules.stripeConnect.section_16_cell_0_1",
        "modules.stripeConnect.section_16_cell_0_2",
        "modules.stripeConnect.section_16_cell_0_3",
        "modules.stripeConnect.section_16_cell_0_4"
      ],
      [
        "modules.stripeConnect.section_16_cell_1_0",
        "modules.stripeConnect.section_16_cell_1_1",
        "modules.stripeConnect.section_16_cell_1_2",
        "modules.stripeConnect.section_16_cell_1_3",
        "modules.stripeConnect.section_16_cell_1_4"
      ],
      [
        "modules.stripeConnect.section_16_cell_2_0",
        "modules.stripeConnect.section_16_cell_2_1",
        "modules.stripeConnect.section_16_cell_2_2",
        "modules.stripeConnect.section_16_cell_2_3",
        "modules.stripeConnect.section_16_cell_2_4"
      ],
      [
        "modules.stripeConnect.section_16_cell_3_0",
        "modules.stripeConnect.section_16_cell_3_1",
        "modules.stripeConnect.section_16_cell_3_2",
        "modules.stripeConnect.section_16_cell_3_3",
        "modules.stripeConnect.section_16_cell_3_4"
      ],
      [
        "modules.stripeConnect.section_16_cell_4_0",
        "modules.stripeConnect.section_16_cell_4_1",
        "modules.stripeConnect.section_16_cell_4_2",
        "modules.stripeConnect.section_16_cell_4_3",
        "modules.stripeConnect.section_16_cell_4_4"
      ],
      [
        "modules.stripeConnect.section_16_cell_5_0",
        "modules.stripeConnect.section_16_cell_5_1",
        "modules.stripeConnect.section_16_cell_5_2",
        "modules.stripeConnect.section_16_cell_5_3",
        "modules.stripeConnect.section_16_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.stripeConnect.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.stripeConnect.section_18_item_0",
      "modules.stripeConnect.section_18_item_1",
      "modules.stripeConnect.section_18_item_2"
    ]
  }
],
  relatedSlugs: [
  "modules/entitlements-overview",
  "modules/billing-engine",
  "modules/invoices"
],
  lastUpdated: "2026-06-09",
});
