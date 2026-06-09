import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/billing-engine",
  titleKey: "modules.billingEngine.title",
  category: "modules",
  order: 6,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_4_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface IPaymentGateway\n{\n    Task<CreateCheckoutSessionResult> CreateCheckoutSessionAsync(CreateCheckoutSessionRequest request);\n    Task<CreatePaymentLinkResult> CreatePaymentLinkAsync(CreatePaymentLinkRequest request);\n    Task<CreatePortalSessionResult> CreatePortalSessionAsync(string customerId, string returnUrl);\n    Task<CancelSubscriptionResult> CancelSubscriptionAsync(string subscriptionId, bool cancelAtPeriodEnd);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_7_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.billingEngine.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_9_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    A[\"Tenant selects edition + billing cycle\"]\n    B([\"POST /billing/checkout-session\"])\n    C([\"Stripe Checkout Session created\"])\n    D{{\"TenantSubscription → PendingPayment\"}}\n    E[\"Tenant redirected to Stripe Checkout\"]\n    F([\"checkout.session.completed webhook\"])\n    G[\"HMAC signature verified\"]\n    H([\"TenantSubscription → Active ✅\"])\n    A --> B\n    B --> C\n    C --> D\n    D --> E\n    E --> F\n    F --> G\n    G --> H",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.billingEngine.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_12_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    A[\"Admin negotiates deal with client\"]\n    B([\"POST /billing/payment-link\"])\n    C([\"Stripe Payment Link created\"])\n    D[\"Admin sends URL to client\"]\n    E[\"Client pays via Stripe\"]\n    F([\"Same webhook flow as self-service\"])\n    A --> B\n    B --> C\n    C --> D\n    D --> E\n    E --> F",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.billingEngine.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_15_content"
  },
  {
    "type": "code",
    "language": "http",
    "code": "POST /api/v1/subscriptions/assign\nAuthorization: Bearer <admin-jwt>\n\n{\n  \"tenantId\": \"encrypted-id\",\n  \"editionId\": \"encrypted-id\",\n  \"subscriptionType\": \"Monthly\",\n  \"currency\": \"USD\"\n  // No Stripe interaction — instant activation\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_18_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.billingEngine.section_19_hdr_0",
      "modules.billingEngine.section_19_hdr_1"
    ],
    "rows": [
      [
        "modules.billingEngine.section_19_cell_0_0",
        "modules.billingEngine.section_19_cell_0_1"
      ],
      [
        "modules.billingEngine.section_19_cell_1_0",
        "modules.billingEngine.section_19_cell_1_1"
      ],
      [
        "modules.billingEngine.section_19_cell_2_0",
        "modules.billingEngine.section_19_cell_2_1"
      ],
      [
        "modules.billingEngine.section_19_cell_3_0",
        "modules.billingEngine.section_19_cell_3_1"
      ],
      [
        "modules.billingEngine.section_19_cell_4_0",
        "modules.billingEngine.section_19_cell_4_1"
      ],
      [
        "modules.billingEngine.section_19_cell_5_0",
        "modules.billingEngine.section_19_cell_5_1"
      ],
      [
        "modules.billingEngine.section_19_cell_6_0",
        "modules.billingEngine.section_19_cell_6_1"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "modules.billingEngine.section_20_title",
    "contentKey": "modules.billingEngine.section_20_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_22_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_24_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_25_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"Stripe\": {\n    \"SecretKey\": \"sk_test_...\",\n    \"PublishableKey\": \"pk_test_...\",\n    \"WebhookSecret\": \"whsec_...\",\n    \"SuccessUrl\": \"https://app.scripe.com/billing/success\",\n    \"CancelUrl\": \"https://app.scripe.com/billing/cancel\"\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_28_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_30_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.billingEngine.section_31_hdr_0",
      "modules.billingEngine.section_31_hdr_1",
      "modules.billingEngine.section_31_hdr_2"
    ],
    "rows": [
      [
        "modules.billingEngine.section_31_cell_0_0",
        "modules.billingEngine.section_31_cell_0_1",
        "modules.billingEngine.section_31_cell_0_2"
      ],
      [
        "modules.billingEngine.section_31_cell_1_0",
        "modules.billingEngine.section_31_cell_1_1",
        "modules.billingEngine.section_31_cell_1_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_33_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.billingEngine.section_35_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.billingEngine.section_36_hdr_0",
      "modules.billingEngine.section_36_hdr_1",
      "modules.billingEngine.section_36_hdr_2",
      "modules.billingEngine.section_36_hdr_3",
      "modules.billingEngine.section_36_hdr_4"
    ],
    "rows": [
      [
        "modules.billingEngine.section_36_cell_0_0",
        "modules.billingEngine.section_36_cell_0_1",
        "modules.billingEngine.section_36_cell_0_2",
        "modules.billingEngine.section_36_cell_0_3",
        "modules.billingEngine.section_36_cell_0_4"
      ],
      [
        "modules.billingEngine.section_36_cell_1_0",
        "modules.billingEngine.section_36_cell_1_1",
        "modules.billingEngine.section_36_cell_1_2",
        "modules.billingEngine.section_36_cell_1_3",
        "modules.billingEngine.section_36_cell_1_4"
      ],
      [
        "modules.billingEngine.section_36_cell_2_0",
        "modules.billingEngine.section_36_cell_2_1",
        "modules.billingEngine.section_36_cell_2_2",
        "modules.billingEngine.section_36_cell_2_3",
        "modules.billingEngine.section_36_cell_2_4"
      ],
      [
        "modules.billingEngine.section_36_cell_3_0",
        "modules.billingEngine.section_36_cell_3_1",
        "modules.billingEngine.section_36_cell_3_2",
        "modules.billingEngine.section_36_cell_3_3",
        "modules.billingEngine.section_36_cell_3_4"
      ],
      [
        "modules.billingEngine.section_36_cell_4_0",
        "modules.billingEngine.section_36_cell_4_1",
        "modules.billingEngine.section_36_cell_4_2",
        "modules.billingEngine.section_36_cell_4_3",
        "modules.billingEngine.section_36_cell_4_4"
      ],
      [
        "modules.billingEngine.section_36_cell_5_0",
        "modules.billingEngine.section_36_cell_5_1",
        "modules.billingEngine.section_36_cell_5_2",
        "modules.billingEngine.section_36_cell_5_3",
        "modules.billingEngine.section_36_cell_5_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.billingEngine.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.billingEngine.section_38_item_0",
      "modules.billingEngine.section_38_item_1",
      "modules.billingEngine.section_38_item_2",
      "modules.billingEngine.section_38_item_3"
    ]
  }
],
  relatedSlugs: [
  "modules/invoices",
  "modules/dunning",
  "modules/subscriptions",
  "features/webhook-system"
],
  lastUpdated: "2026-06-09",
});
