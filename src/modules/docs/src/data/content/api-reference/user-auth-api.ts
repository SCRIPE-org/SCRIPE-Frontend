import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/user-auth-api",
  titleKey: "apiReference.userAuthApi.title",
  category: "api-reference",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_3_hdr_0",
      "apiReference.userAuthApi.section_3_hdr_1"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_3_cell_0_0",
        "apiReference.userAuthApi.section_3_cell_0_1"
      ],
      [
        "apiReference.userAuthApi.section_3_cell_1_0",
        "apiReference.userAuthApi.section_3_cell_1_1"
      ],
      [
        "apiReference.userAuthApi.section_3_cell_2_0",
        "apiReference.userAuthApi.section_3_cell_2_1"
      ],
      [
        "apiReference.userAuthApi.section_3_cell_3_0",
        "apiReference.userAuthApi.section_3_cell_3_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_5_hdr_0",
      "apiReference.userAuthApi.section_5_hdr_1",
      "apiReference.userAuthApi.section_5_hdr_2",
      "apiReference.userAuthApi.section_5_hdr_3",
      "apiReference.userAuthApi.section_5_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_5_cell_0_0",
        "apiReference.userAuthApi.section_5_cell_0_1",
        "apiReference.userAuthApi.section_5_cell_0_2",
        "apiReference.userAuthApi.section_5_cell_0_3",
        "apiReference.userAuthApi.section_5_cell_0_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_7_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"SecureP@ss1!\",\n  \"confirmPassword\": \"SecureP@ss1!\",\n  \"firstName\": \"Alice\",\n  \"lastName\": \"Johnson\",\n  \"phoneNumber\": \"+1234567890\",\n  \"tenantId\": \"f8e7d6c5-b4a3-2190-fedc-ba0987654321\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_10_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"id\": \"new-user-uuid\",\n  \"email\": \"user@example.com\",\n  \"message\": \"Registration successful. Please verify your email.\",\n  \"requiresEmailVerification\": true\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_13_hdr_0",
      "apiReference.userAuthApi.section_13_hdr_1",
      "apiReference.userAuthApi.section_13_hdr_2",
      "apiReference.userAuthApi.section_13_hdr_3",
      "apiReference.userAuthApi.section_13_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_13_cell_0_0",
        "apiReference.userAuthApi.section_13_cell_0_1",
        "apiReference.userAuthApi.section_13_cell_0_2",
        "apiReference.userAuthApi.section_13_cell_0_3",
        "apiReference.userAuthApi.section_13_cell_0_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_14_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{ \"email\": \"user@example.com\", \"password\": \"SecureP@ss1!\" }\n\n// Response (200)\n{\n  \"accessToken\": \"eyJhbGciOiJIUzI1NiJ9...\",\n  \"refreshToken\": \"cmVmcmVzaC10b2tlbg...\",\n  \"expiresIn\": 900,\n  \"requiresTwoFactor\": false,\n  \"user\": {\n    \"id\": \"user-uuid\",\n    \"email\": \"user@example.com\",\n    \"firstName\": \"Alice\",\n    \"role\": \"User\",\n    \"tenantId\": \"tenant-uuid\",\n    \"emailVerified\": true,\n    \"phoneVerified\": false\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_17_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_18_hdr_0",
      "apiReference.userAuthApi.section_18_hdr_1",
      "apiReference.userAuthApi.section_18_hdr_2",
      "apiReference.userAuthApi.section_18_hdr_3",
      "apiReference.userAuthApi.section_18_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_18_cell_0_0",
        "apiReference.userAuthApi.section_18_cell_0_1",
        "apiReference.userAuthApi.section_18_cell_0_2",
        "apiReference.userAuthApi.section_18_cell_0_3",
        "apiReference.userAuthApi.section_18_cell_0_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_20_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{\n  \"provider\": \"google\",\n  \"token\": \"ya29.a0AfH6SMC...\",\n  \"tenantId\": \"tenant-uuid\"\n}\n\n// Response (200) — New or existing user\n{\n  \"accessToken\": \"eyJhbGciOiJIUzI1NiJ9...\",\n  \"refreshToken\": \"cmVmcmVzaC10b2tlbg...\",\n  \"expiresIn\": 900,\n  \"isNewUser\": true,\n  \"user\": {\n    \"id\": \"user-uuid\",\n    \"email\": \"alice@gmail.com\",\n    \"firstName\": \"Alice\",\n    \"lastName\": \"Johnson\",\n    \"avatarUrl\": \"https://lh3.googleusercontent.com/...\",\n    \"provider\": \"google\"\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_23_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"provider\": \"facebook\",\n  \"token\": \"EAAGm0PX4ZCps...\",\n  \"tenantId\": \"tenant-uuid\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_26_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"provider\": \"apple\",\n  \"token\": \"eyJraWQiOiI4NkQ4OT...\",\n  \"tenantId\": \"tenant-uuid\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_29_hdr_0",
      "apiReference.userAuthApi.section_29_hdr_1",
      "apiReference.userAuthApi.section_29_hdr_2",
      "apiReference.userAuthApi.section_29_hdr_3",
      "apiReference.userAuthApi.section_29_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_29_cell_0_0",
        "apiReference.userAuthApi.section_29_cell_0_1",
        "apiReference.userAuthApi.section_29_cell_0_2",
        "apiReference.userAuthApi.section_29_cell_0_3",
        "apiReference.userAuthApi.section_29_cell_0_4"
      ],
      [
        "apiReference.userAuthApi.section_29_cell_1_0",
        "apiReference.userAuthApi.section_29_cell_1_1",
        "apiReference.userAuthApi.section_29_cell_1_2",
        "apiReference.userAuthApi.section_29_cell_1_3",
        "apiReference.userAuthApi.section_29_cell_1_4"
      ],
      [
        "apiReference.userAuthApi.section_29_cell_2_0",
        "apiReference.userAuthApi.section_29_cell_2_1",
        "apiReference.userAuthApi.section_29_cell_2_2",
        "apiReference.userAuthApi.section_29_cell_2_3",
        "apiReference.userAuthApi.section_29_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_31_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{\n  \"email\": \"user@example.com\",\n  \"code\": \"123456\"\n}\n\n// Response (200)\n{\n  \"message\": \"Email verified successfully\",\n  \"emailVerified\": true\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_34_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{\n  \"email\": \"user@example.com\",\n  \"type\": \"email\"  // \"email\" | \"phone\"\n}\n\n// Response (200)\n{\n  \"message\": \"Verification code sent\",\n  \"expiresIn\": 900\n}\n\n// Rate limited: max 5 requests per hour per email/phone",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_37_hdr_0",
      "apiReference.userAuthApi.section_37_hdr_1",
      "apiReference.userAuthApi.section_37_hdr_2",
      "apiReference.userAuthApi.section_37_hdr_3",
      "apiReference.userAuthApi.section_37_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_37_cell_0_0",
        "apiReference.userAuthApi.section_37_cell_0_1",
        "apiReference.userAuthApi.section_37_cell_0_2",
        "apiReference.userAuthApi.section_37_cell_0_3",
        "apiReference.userAuthApi.section_37_cell_0_4"
      ],
      [
        "apiReference.userAuthApi.section_37_cell_1_0",
        "apiReference.userAuthApi.section_37_cell_1_1",
        "apiReference.userAuthApi.section_37_cell_1_2",
        "apiReference.userAuthApi.section_37_cell_1_3",
        "apiReference.userAuthApi.section_37_cell_1_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_38_title",
    "id": "sec_38"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_39_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{ \"email\": \"user@example.com\" }\n\n// Response (200) — Always returns success (prevent email enumeration)\n{ \"message\": \"If an account exists, a reset code has been sent\" }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.userAuthApi.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.userAuthApi.section_42_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{\n  \"email\": \"user@example.com\",\n  \"code\": \"123456\",\n  \"newPassword\": \"NewSecureP@ss2!\",\n  \"confirmPassword\": \"NewSecureP@ss2!\"\n}\n\n// Response (200)\n{ \"message\": \"Password reset successfully\" }",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_44_title",
    "id": "sec_44"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_45_hdr_0",
      "apiReference.userAuthApi.section_45_hdr_1",
      "apiReference.userAuthApi.section_45_hdr_2",
      "apiReference.userAuthApi.section_45_hdr_3",
      "apiReference.userAuthApi.section_45_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_45_cell_0_0",
        "apiReference.userAuthApi.section_45_cell_0_1",
        "apiReference.userAuthApi.section_45_cell_0_2",
        "apiReference.userAuthApi.section_45_cell_0_3",
        "apiReference.userAuthApi.section_45_cell_0_4"
      ],
      [
        "apiReference.userAuthApi.section_45_cell_1_0",
        "apiReference.userAuthApi.section_45_cell_1_1",
        "apiReference.userAuthApi.section_45_cell_1_2",
        "apiReference.userAuthApi.section_45_cell_1_3",
        "apiReference.userAuthApi.section_45_cell_1_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_46_title",
    "id": "sec_46"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_47_hdr_0",
      "apiReference.userAuthApi.section_47_hdr_1",
      "apiReference.userAuthApi.section_47_hdr_2",
      "apiReference.userAuthApi.section_47_hdr_3",
      "apiReference.userAuthApi.section_47_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_47_cell_0_0",
        "apiReference.userAuthApi.section_47_cell_0_1",
        "apiReference.userAuthApi.section_47_cell_0_2",
        "apiReference.userAuthApi.section_47_cell_0_3",
        "apiReference.userAuthApi.section_47_cell_0_4"
      ],
      [
        "apiReference.userAuthApi.section_47_cell_1_0",
        "apiReference.userAuthApi.section_47_cell_1_1",
        "apiReference.userAuthApi.section_47_cell_1_2",
        "apiReference.userAuthApi.section_47_cell_1_3",
        "apiReference.userAuthApi.section_47_cell_1_4"
      ],
      [
        "apiReference.userAuthApi.section_47_cell_2_0",
        "apiReference.userAuthApi.section_47_cell_2_1",
        "apiReference.userAuthApi.section_47_cell_2_2",
        "apiReference.userAuthApi.section_47_cell_2_3",
        "apiReference.userAuthApi.section_47_cell_2_4"
      ],
      [
        "apiReference.userAuthApi.section_47_cell_3_0",
        "apiReference.userAuthApi.section_47_cell_3_1",
        "apiReference.userAuthApi.section_47_cell_3_2",
        "apiReference.userAuthApi.section_47_cell_3_3",
        "apiReference.userAuthApi.section_47_cell_3_4"
      ],
      [
        "apiReference.userAuthApi.section_47_cell_4_0",
        "apiReference.userAuthApi.section_47_cell_4_1",
        "apiReference.userAuthApi.section_47_cell_4_2",
        "apiReference.userAuthApi.section_47_cell_4_3",
        "apiReference.userAuthApi.section_47_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_48_title",
    "id": "sec_48"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_49_hdr_0",
      "apiReference.userAuthApi.section_49_hdr_1",
      "apiReference.userAuthApi.section_49_hdr_2",
      "apiReference.userAuthApi.section_49_hdr_3",
      "apiReference.userAuthApi.section_49_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_49_cell_0_0",
        "apiReference.userAuthApi.section_49_cell_0_1",
        "apiReference.userAuthApi.section_49_cell_0_2",
        "apiReference.userAuthApi.section_49_cell_0_3",
        "apiReference.userAuthApi.section_49_cell_0_4"
      ],
      [
        "apiReference.userAuthApi.section_49_cell_1_0",
        "apiReference.userAuthApi.section_49_cell_1_1",
        "apiReference.userAuthApi.section_49_cell_1_2",
        "apiReference.userAuthApi.section_49_cell_1_3",
        "apiReference.userAuthApi.section_49_cell_1_4"
      ],
      [
        "apiReference.userAuthApi.section_49_cell_2_0",
        "apiReference.userAuthApi.section_49_cell_2_1",
        "apiReference.userAuthApi.section_49_cell_2_2",
        "apiReference.userAuthApi.section_49_cell_2_3",
        "apiReference.userAuthApi.section_49_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.userAuthApi.section_51_hdr_0",
      "apiReference.userAuthApi.section_51_hdr_1",
      "apiReference.userAuthApi.section_51_hdr_2",
      "apiReference.userAuthApi.section_51_hdr_3",
      "apiReference.userAuthApi.section_51_hdr_4"
    ],
    "rows": [
      [
        "apiReference.userAuthApi.section_51_cell_0_0",
        "apiReference.userAuthApi.section_51_cell_0_1",
        "apiReference.userAuthApi.section_51_cell_0_2",
        "apiReference.userAuthApi.section_51_cell_0_3",
        "apiReference.userAuthApi.section_51_cell_0_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_1_0",
        "apiReference.userAuthApi.section_51_cell_1_1",
        "apiReference.userAuthApi.section_51_cell_1_2",
        "apiReference.userAuthApi.section_51_cell_1_3",
        "apiReference.userAuthApi.section_51_cell_1_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_2_0",
        "apiReference.userAuthApi.section_51_cell_2_1",
        "apiReference.userAuthApi.section_51_cell_2_2",
        "apiReference.userAuthApi.section_51_cell_2_3",
        "apiReference.userAuthApi.section_51_cell_2_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_3_0",
        "apiReference.userAuthApi.section_51_cell_3_1",
        "apiReference.userAuthApi.section_51_cell_3_2",
        "apiReference.userAuthApi.section_51_cell_3_3",
        "apiReference.userAuthApi.section_51_cell_3_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_4_0",
        "apiReference.userAuthApi.section_51_cell_4_1",
        "apiReference.userAuthApi.section_51_cell_4_2",
        "apiReference.userAuthApi.section_51_cell_4_3",
        "apiReference.userAuthApi.section_51_cell_4_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_5_0",
        "apiReference.userAuthApi.section_51_cell_5_1",
        "apiReference.userAuthApi.section_51_cell_5_2",
        "apiReference.userAuthApi.section_51_cell_5_3",
        "apiReference.userAuthApi.section_51_cell_5_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_6_0",
        "apiReference.userAuthApi.section_51_cell_6_1",
        "apiReference.userAuthApi.section_51_cell_6_2",
        "apiReference.userAuthApi.section_51_cell_6_3",
        "apiReference.userAuthApi.section_51_cell_6_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_7_0",
        "apiReference.userAuthApi.section_51_cell_7_1",
        "apiReference.userAuthApi.section_51_cell_7_2",
        "apiReference.userAuthApi.section_51_cell_7_3",
        "apiReference.userAuthApi.section_51_cell_7_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_8_0",
        "apiReference.userAuthApi.section_51_cell_8_1",
        "apiReference.userAuthApi.section_51_cell_8_2",
        "apiReference.userAuthApi.section_51_cell_8_3",
        "apiReference.userAuthApi.section_51_cell_8_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_9_0",
        "apiReference.userAuthApi.section_51_cell_9_1",
        "apiReference.userAuthApi.section_51_cell_9_2",
        "apiReference.userAuthApi.section_51_cell_9_3",
        "apiReference.userAuthApi.section_51_cell_9_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_10_0",
        "apiReference.userAuthApi.section_51_cell_10_1",
        "apiReference.userAuthApi.section_51_cell_10_2",
        "apiReference.userAuthApi.section_51_cell_10_3",
        "apiReference.userAuthApi.section_51_cell_10_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_11_0",
        "apiReference.userAuthApi.section_51_cell_11_1",
        "apiReference.userAuthApi.section_51_cell_11_2",
        "apiReference.userAuthApi.section_51_cell_11_3",
        "apiReference.userAuthApi.section_51_cell_11_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_12_0",
        "apiReference.userAuthApi.section_51_cell_12_1",
        "apiReference.userAuthApi.section_51_cell_12_2",
        "apiReference.userAuthApi.section_51_cell_12_3",
        "apiReference.userAuthApi.section_51_cell_12_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_13_0",
        "apiReference.userAuthApi.section_51_cell_13_1",
        "apiReference.userAuthApi.section_51_cell_13_2",
        "apiReference.userAuthApi.section_51_cell_13_3",
        "apiReference.userAuthApi.section_51_cell_13_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_14_0",
        "apiReference.userAuthApi.section_51_cell_14_1",
        "apiReference.userAuthApi.section_51_cell_14_2",
        "apiReference.userAuthApi.section_51_cell_14_3",
        "apiReference.userAuthApi.section_51_cell_14_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_15_0",
        "apiReference.userAuthApi.section_51_cell_15_1",
        "apiReference.userAuthApi.section_51_cell_15_2",
        "apiReference.userAuthApi.section_51_cell_15_3",
        "apiReference.userAuthApi.section_51_cell_15_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_16_0",
        "apiReference.userAuthApi.section_51_cell_16_1",
        "apiReference.userAuthApi.section_51_cell_16_2",
        "apiReference.userAuthApi.section_51_cell_16_3",
        "apiReference.userAuthApi.section_51_cell_16_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_17_0",
        "apiReference.userAuthApi.section_51_cell_17_1",
        "apiReference.userAuthApi.section_51_cell_17_2",
        "apiReference.userAuthApi.section_51_cell_17_3",
        "apiReference.userAuthApi.section_51_cell_17_4"
      ],
      [
        "apiReference.userAuthApi.section_51_cell_18_0",
        "apiReference.userAuthApi.section_51_cell_18_1",
        "apiReference.userAuthApi.section_51_cell_18_2",
        "apiReference.userAuthApi.section_51_cell_18_3",
        "apiReference.userAuthApi.section_51_cell_18_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "apiReference.userAuthApi.section_52_title",
    "contentKey": "apiReference.userAuthApi.section_52_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.userAuthApi.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.userAuthApi.section_54_item_0",
      "apiReference.userAuthApi.section_54_item_1",
      "apiReference.userAuthApi.section_54_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/authentication-api",
  "security/authentication-deep",
  "api-reference/admin-api"
],
  lastUpdated: "2026-06-09",
});
