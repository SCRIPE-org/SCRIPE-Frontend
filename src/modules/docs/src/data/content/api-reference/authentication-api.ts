import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "api-reference/authentication-api",
  titleKey: "apiReference.authApi.title",
  category: "api-reference",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.authApi.section_3_hdr_0",
      "apiReference.authApi.section_3_hdr_1",
      "apiReference.authApi.section_3_hdr_2"
    ],
    "rows": [
      [
        "apiReference.authApi.section_3_cell_0_0",
        "apiReference.authApi.section_3_cell_0_1",
        "apiReference.authApi.section_3_cell_0_2"
      ],
      [
        "apiReference.authApi.section_3_cell_1_0",
        "apiReference.authApi.section_3_cell_1_1",
        "apiReference.authApi.section_3_cell_1_2"
      ],
      [
        "apiReference.authApi.section_3_cell_2_0",
        "apiReference.authApi.section_3_cell_2_1",
        "apiReference.authApi.section_3_cell_2_2"
      ],
      [
        "apiReference.authApi.section_3_cell_3_0",
        "apiReference.authApi.section_3_cell_3_1",
        "apiReference.authApi.section_3_cell_3_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.authApi.section_5_hdr_0",
      "apiReference.authApi.section_5_hdr_1",
      "apiReference.authApi.section_5_hdr_2",
      "apiReference.authApi.section_5_hdr_3",
      "apiReference.authApi.section_5_hdr_4"
    ],
    "rows": [
      [
        "apiReference.authApi.section_5_cell_0_0",
        "apiReference.authApi.section_5_cell_0_1",
        "apiReference.authApi.section_5_cell_0_2",
        "apiReference.authApi.section_5_cell_0_3",
        "apiReference.authApi.section_5_cell_0_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_7_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"email\": \"admin@company.com\",\n  \"password\": \"P@ssw0rd123!\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_10_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",\n  \"refreshToken\": \"dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...\",\n  \"expiresIn\": 900,\n  \"tokenType\": \"Bearer\",\n  \"requiresTwoFactor\": false,\n  \"user\": {\n    \"id\": \"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\n    \"email\": \"admin@company.com\",\n    \"firstName\": \"John\",\n    \"lastName\": \"Doe\",\n    \"role\": \"SuperAdmin\",\n    \"avatarUrl\": \"/uploads/avatars/a1b2c3d4.jpg\",\n    \"tenantId\": \"f8e7d6c5-b4a3-2190-fedc-ba0987654321\",\n    \"tenantName\": \"Acme Corp\"\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_13_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"requiresTwoFactor\": true,\n  \"twoFactorSessionToken\": \"temp_session_abc123...\",\n  \"message\": \"Two-factor authentication required\"\n}\n// Client must call POST /auth/2fa/verify with session token + TOTP code",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_16_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// 401 - Invalid credentials\n{ \"error\": \"Invalid email or password\" }\n\n// 423 - Account locked\n{\n  \"error\": \"Account is locked\",\n  \"lockoutEnd\": \"2026-02-20T18:00:00Z\",\n  \"attemptsRemaining\": 0\n}\n\n// 403 - Account disabled\n{ \"error\": \"Account has been deactivated\" }\n\n// 429 - Rate limited\n{\n  \"error\": \"Too many login attempts\",\n  \"retryAfter\": 300\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.authApi.section_19_hdr_0",
      "apiReference.authApi.section_19_hdr_1",
      "apiReference.authApi.section_19_hdr_2",
      "apiReference.authApi.section_19_hdr_3",
      "apiReference.authApi.section_19_hdr_4"
    ],
    "rows": [
      [
        "apiReference.authApi.section_19_cell_0_0",
        "apiReference.authApi.section_19_cell_0_1",
        "apiReference.authApi.section_19_cell_0_2",
        "apiReference.authApi.section_19_cell_0_3",
        "apiReference.authApi.section_19_cell_0_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_21_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"refreshToken\": \"dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...\"\n}\n// Note: Refresh token can also be sent via HttpOnly cookie",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_24_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"accessToken\": \"eyJhbGciOiJIUzI1NiJ9.new_token...\",\n  \"refreshToken\": \"bmV3IHJlZnJlc2ggdG9rZW4...\",\n  \"expiresIn\": 900\n}\n// Old refresh token is revoked (single-use rotation)",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.authApi.section_27_hdr_0",
      "apiReference.authApi.section_27_hdr_1",
      "apiReference.authApi.section_27_hdr_2",
      "apiReference.authApi.section_27_hdr_3",
      "apiReference.authApi.section_27_hdr_4"
    ],
    "rows": [
      [
        "apiReference.authApi.section_27_cell_0_0",
        "apiReference.authApi.section_27_cell_0_1",
        "apiReference.authApi.section_27_cell_0_2",
        "apiReference.authApi.section_27_cell_0_3",
        "apiReference.authApi.section_27_cell_0_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_28_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"message\": \"Logged out successfully\"\n}\n// All refresh tokens for this user are revoked\n// Access token remains valid until expiry (15 min max)",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_31_content"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.authApi.section_32_hdr_0",
      "apiReference.authApi.section_32_hdr_1",
      "apiReference.authApi.section_32_hdr_2",
      "apiReference.authApi.section_32_hdr_3",
      "apiReference.authApi.section_32_hdr_4"
    ],
    "rows": [
      [
        "apiReference.authApi.section_32_cell_0_0",
        "apiReference.authApi.section_32_cell_0_1",
        "apiReference.authApi.section_32_cell_0_2",
        "apiReference.authApi.section_32_cell_0_3",
        "apiReference.authApi.section_32_cell_0_4"
      ],
      [
        "apiReference.authApi.section_32_cell_1_0",
        "apiReference.authApi.section_32_cell_1_1",
        "apiReference.authApi.section_32_cell_1_2",
        "apiReference.authApi.section_32_cell_1_3",
        "apiReference.authApi.section_32_cell_1_4"
      ],
      [
        "apiReference.authApi.section_32_cell_2_0",
        "apiReference.authApi.section_32_cell_2_1",
        "apiReference.authApi.section_32_cell_2_2",
        "apiReference.authApi.section_32_cell_2_3",
        "apiReference.authApi.section_32_cell_2_4"
      ],
      [
        "apiReference.authApi.section_32_cell_3_0",
        "apiReference.authApi.section_32_cell_3_1",
        "apiReference.authApi.section_32_cell_3_2",
        "apiReference.authApi.section_32_cell_3_3",
        "apiReference.authApi.section_32_cell_3_4"
      ],
      [
        "apiReference.authApi.section_32_cell_4_0",
        "apiReference.authApi.section_32_cell_4_1",
        "apiReference.authApi.section_32_cell_4_2",
        "apiReference.authApi.section_32_cell_4_3",
        "apiReference.authApi.section_32_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_34_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"secret\": \"JBSWY3DPEHPK3PXP\",\n  \"qrCodeUri\": \"otpauth://totp/SCRIPE:admin@company.com?secret=JBSWY3DPEHPK3PXP&issuer=SCRIPE\",\n  \"qrCodeBase64\": \"data:image/png;base64,iVBOR...\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_37_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{ \"code\": \"123456\" }\n\n// Response (200)\n{\n  \"backupCodes\": [\n    \"12345678\", \"23456789\", \"34567890\",\n    \"45678901\", \"56789012\", \"67890123\",\n    \"78901234\", \"89012345\", \"90123456\", \"01234567\"\n  ],\n  \"message\": \"2FA enabled successfully. Save your backup codes!\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_40_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "// Request\n{\n  \"sessionToken\": \"temp_session_abc123...\",\n  \"code\": \"654321\"\n}\n\n// Response (200) — Same as login success\n{\n  \"accessToken\": \"eyJhbGciOiJIUzI1NiJ9...\",\n  \"refreshToken\": \"cmVmcmVzaC10b2tlbg...\",\n  \"expiresIn\": 900,\n  \"user\": { ... }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_42_title",
    "id": "sec_42"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.authApi.section_43_hdr_0",
      "apiReference.authApi.section_43_hdr_1",
      "apiReference.authApi.section_43_hdr_2",
      "apiReference.authApi.section_43_hdr_3",
      "apiReference.authApi.section_43_hdr_4"
    ],
    "rows": [
      [
        "apiReference.authApi.section_43_cell_0_0",
        "apiReference.authApi.section_43_cell_0_1",
        "apiReference.authApi.section_43_cell_0_2",
        "apiReference.authApi.section_43_cell_0_3",
        "apiReference.authApi.section_43_cell_0_4"
      ],
      [
        "apiReference.authApi.section_43_cell_1_0",
        "apiReference.authApi.section_43_cell_1_1",
        "apiReference.authApi.section_43_cell_1_2",
        "apiReference.authApi.section_43_cell_1_3",
        "apiReference.authApi.section_43_cell_1_4"
      ],
      [
        "apiReference.authApi.section_43_cell_2_0",
        "apiReference.authApi.section_43_cell_2_1",
        "apiReference.authApi.section_43_cell_2_2",
        "apiReference.authApi.section_43_cell_2_3",
        "apiReference.authApi.section_43_cell_2_4"
      ],
      [
        "apiReference.authApi.section_43_cell_3_0",
        "apiReference.authApi.section_43_cell_3_1",
        "apiReference.authApi.section_43_cell_3_2",
        "apiReference.authApi.section_43_cell_3_3",
        "apiReference.authApi.section_43_cell_3_4"
      ],
      [
        "apiReference.authApi.section_43_cell_4_0",
        "apiReference.authApi.section_43_cell_4_1",
        "apiReference.authApi.section_43_cell_4_2",
        "apiReference.authApi.section_43_cell_4_3",
        "apiReference.authApi.section_43_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_44_title",
    "id": "sec_44"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_45_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"id\": \"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\n  \"email\": \"admin@company.com\",\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"phoneNumber\": \"+1234567890\",\n  \"role\": {\n    \"id\": \"role-uuid\",\n    \"name\": \"SuperAdmin\"\n  },\n  \"permissions\": [\"admins.view\", \"users.view\", \"roles.manage\"],\n  \"tenant\": {\n    \"id\": \"tenant-uuid\",\n    \"name\": \"Acme Corp\",\n    \"logoUrl\": \"/uploads/tenants/acme-logo.png\"\n  },\n  \"avatarUrl\": \"/uploads/avatars/john.jpg\",\n  \"twoFactorEnabled\": true,\n  \"emailVerified\": true,\n  \"createdAt\": \"2026-01-15T10:30:00Z\",\n  \"lastLoginAt\": \"2026-02-20T14:00:00Z\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_47_title",
    "id": "sec_47"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_48_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"firstName\": \"Jane\",\n  \"lastName\": \"Smith\",\n  \"phoneNumber\": \"+9876543210\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "apiReference.authApi.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "paragraph",
    "contentKey": "apiReference.authApi.section_51_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"currentPassword\": \"OldP@ss123!\",\n  \"newPassword\": \"NewP@ss456!\",\n  \"confirmPassword\": \"NewP@ss456!\"\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "table",
    "headers": [
      "apiReference.authApi.section_54_hdr_0",
      "apiReference.authApi.section_54_hdr_1",
      "apiReference.authApi.section_54_hdr_2",
      "apiReference.authApi.section_54_hdr_3",
      "apiReference.authApi.section_54_hdr_4"
    ],
    "rows": [
      [
        "apiReference.authApi.section_54_cell_0_0",
        "apiReference.authApi.section_54_cell_0_1",
        "apiReference.authApi.section_54_cell_0_2",
        "apiReference.authApi.section_54_cell_0_3",
        "apiReference.authApi.section_54_cell_0_4"
      ],
      [
        "apiReference.authApi.section_54_cell_1_0",
        "apiReference.authApi.section_54_cell_1_1",
        "apiReference.authApi.section_54_cell_1_2",
        "apiReference.authApi.section_54_cell_1_3",
        "apiReference.authApi.section_54_cell_1_4"
      ],
      [
        "apiReference.authApi.section_54_cell_2_0",
        "apiReference.authApi.section_54_cell_2_1",
        "apiReference.authApi.section_54_cell_2_2",
        "apiReference.authApi.section_54_cell_2_3",
        "apiReference.authApi.section_54_cell_2_4"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "apiReference.authApi.section_55_title",
    "contentKey": "apiReference.authApi.section_55_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "apiReference.authApi.section_56_title",
    "id": "sec_56"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "apiReference.authApi.section_57_item_0",
      "apiReference.authApi.section_57_item_1",
      "apiReference.authApi.section_57_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/user-auth-api",
  "security/authentication-deep",
  "api-reference/admin-api"
],
  lastUpdated: "2026-06-09",
});
