import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/authentication",
  titleKey: "features.authentication.title",
  category: "features",
  order: 1,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    login[\"POST /auth/login\"]\n    route([\"Route Decision\"])\n    %% route: Check tenantId & isPlatformAdmin flags\n    caseA([\"Case A: Tenant-Scoped\"])\n    %% caseA: tenantId provided → strict domain isolation\n    caseAp([\"Case A': Platform Admin\"])\n    %% caseAp: isPlatformAdmin = true → direct platform auth\n    caseB{{\"Case B: Discovery\"}}\n    %% caseB: No tenantId → workspace discovery\n    validate{{\"Validate Credentials + BCrypt\"}}\n    lockout[\"Check Lockout (5 attempts / 15 min)\"]\n    pwExpiry{{\"Password Expiry Check\"}}\n    %% pwExpiry: ITenantPasswordValidator → MustChangePassword\n    2fa([\"2FA Required?\"])\n    no2fa([\"Issue JWT + Refresh Token\"])\n    yes2fa([\"Issue Temporary 2FA Token\"])\n    verify2fa[\"POST /auth/verify-2fa\"]\n    jwt([\"Issue Full JWT + Refresh Token\"])\n    workspace([\"Workspace Picker\"])\n    %% workspace: Frontend shows workspace list\n    login --> route\n    route -->|\"has tenantId\"| caseA\n    route -->|\"isPlatformAdmin\"| caseAp\n    route -->|\"neither\"| caseB\n    caseA --> validate\n    caseAp --> validate\n    caseB -->|\"1 match\"| validate\n    caseB -->|\"N matches\"| workspace\n    workspace -.->|\"re-login with tenantId\"| login\n    validate --> lockout\n    lockout --> pwExpiry\n    pwExpiry --> 2fa\n    2fa -->|\"No\"| no2fa\n    2fa -->|\"Yes\"| yes2fa\n    yes2fa --> verify2fa\n    verify2fa --> jwt",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_5_content"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_6_hdr_0",
      "features.authentication.section_6_hdr_1",
      "features.authentication.section_6_hdr_2"
    ],
    "rows": [
      [
        "features.authentication.section_6_cell_0_0",
        "features.authentication.section_6_cell_0_1",
        "features.authentication.section_6_cell_0_2"
      ],
      [
        "features.authentication.section_6_cell_1_0",
        "features.authentication.section_6_cell_1_1",
        "features.authentication.section_6_cell_1_2"
      ],
      [
        "features.authentication.section_6_cell_2_0",
        "features.authentication.section_6_cell_2_1",
        "features.authentication.section_6_cell_2_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.authentication.section_7_title",
    "contentKey": "features.authentication.section_7_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_9_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_11_content"
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.authentication.section_12_title",
    "contentKey": "features.authentication.section_12_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_14_content"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_15_hdr_0",
      "features.authentication.section_15_hdr_1",
      "features.authentication.section_15_hdr_2",
      "features.authentication.section_15_hdr_3"
    ],
    "rows": [
      [
        "features.authentication.section_15_cell_0_0",
        "features.authentication.section_15_cell_0_1",
        "features.authentication.section_15_cell_0_2",
        "features.authentication.section_15_cell_0_3"
      ],
      [
        "features.authentication.section_15_cell_1_0",
        "features.authentication.section_15_cell_1_1",
        "features.authentication.section_15_cell_1_2",
        "features.authentication.section_15_cell_1_3"
      ],
      [
        "features.authentication.section_15_cell_2_0",
        "features.authentication.section_15_cell_2_1",
        "features.authentication.section_15_cell_2_2",
        "features.authentication.section_15_cell_2_3"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "var claims = new[]\n{\n    new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),\n    new Claim(\"TenantId\", admin.TenantId.ToString()),\n    new Claim(\"IsSuperAdmin\", admin.IsSuperAdmin.ToString()),\n    new Claim(ClaimTypes.Role, string.Join(\",\", roleNames)),\n};\n\nvar token = new JwtSecurityToken(\n    issuer: _config[\"Jwt:Issuer\"],\n    audience: _config[\"Jwt:Audience\"],\n    claims: claims,\n    expires: DateTime.UtcNow.AddMinutes(15),\n    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)\n);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_19_content"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_20_hdr_0",
      "features.authentication.section_20_hdr_1",
      "features.authentication.section_20_hdr_2"
    ],
    "rows": [
      [
        "features.authentication.section_20_cell_0_0",
        "features.authentication.section_20_cell_0_1",
        "features.authentication.section_20_cell_0_2"
      ],
      [
        "features.authentication.section_20_cell_1_0",
        "features.authentication.section_20_cell_1_1",
        "features.authentication.section_20_cell_1_2"
      ],
      [
        "features.authentication.section_20_cell_2_0",
        "features.authentication.section_20_cell_2_1",
        "features.authentication.section_20_cell_2_2"
      ],
      [
        "features.authentication.section_20_cell_3_0",
        "features.authentication.section_20_cell_3_1",
        "features.authentication.section_20_cell_3_2"
      ],
      [
        "features.authentication.section_20_cell_4_0",
        "features.authentication.section_20_cell_4_1",
        "features.authentication.section_20_cell_4_2"
      ],
      [
        "features.authentication.section_20_cell_5_0",
        "features.authentication.section_20_cell_5_1",
        "features.authentication.section_20_cell_5_2"
      ],
      [
        "features.authentication.section_20_cell_6_0",
        "features.authentication.section_20_cell_6_1",
        "features.authentication.section_20_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_22_content"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_23_hdr_0",
      "features.authentication.section_23_hdr_1",
      "features.authentication.section_23_hdr_2"
    ],
    "rows": [
      [
        "features.authentication.section_23_cell_0_0",
        "features.authentication.section_23_cell_0_1",
        "features.authentication.section_23_cell_0_2"
      ],
      [
        "features.authentication.section_23_cell_1_0",
        "features.authentication.section_23_cell_1_1",
        "features.authentication.section_23_cell_1_2"
      ],
      [
        "features.authentication.section_23_cell_2_0",
        "features.authentication.section_23_cell_2_1",
        "features.authentication.section_23_cell_2_2"
      ],
      [
        "features.authentication.section_23_cell_3_0",
        "features.authentication.section_23_cell_3_1",
        "features.authentication.section_23_cell_3_2"
      ],
      [
        "features.authentication.section_23_cell_4_0",
        "features.authentication.section_23_cell_4_1",
        "features.authentication.section_23_cell_4_2"
      ],
      [
        "features.authentication.section_23_cell_5_0",
        "features.authentication.section_23_cell_5_1",
        "features.authentication.section_23_cell_5_2"
      ],
      [
        "features.authentication.section_23_cell_6_0",
        "features.authentication.section_23_cell_6_1",
        "features.authentication.section_23_cell_6_2"
      ],
      [
        "features.authentication.section_23_cell_7_0",
        "features.authentication.section_23_cell_7_1",
        "features.authentication.section_23_cell_7_2"
      ],
      [
        "features.authentication.section_23_cell_8_0",
        "features.authentication.section_23_cell_8_1",
        "features.authentication.section_23_cell_8_2"
      ],
      [
        "features.authentication.section_23_cell_9_0",
        "features.authentication.section_23_cell_9_1",
        "features.authentication.section_23_cell_9_2"
      ],
      [
        "features.authentication.section_23_cell_10_0",
        "features.authentication.section_23_cell_10_1",
        "features.authentication.section_23_cell_10_2"
      ],
      [
        "features.authentication.section_23_cell_11_0",
        "features.authentication.section_23_cell_11_1",
        "features.authentication.section_23_cell_11_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_25_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_26_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// In Verify2FA handler:\nif (admin.LastTwoFactorCodeUsed == code &&\n    admin.LastTwoFactorCodeUsedAt?.AddMinutes(1) > DateTime.UtcNow)\n{\n    // Same code used within 1 minute  replay attack!\n    return Result.Failure(\"2FA code already used\");\n}\n\n// Verify TOTP\nvar totp = new Totp(Base32Encoding.ToBytes(admin.TwoFactorSecret));\nbool isValid = totp.VerifyTotp(code, out _);\n\n// If backup code\nif (!isValid && admin.BackupCodesJson != null)\n{\n    var backupCodes = JsonSerializer.Deserialize<List<string>>(admin.BackupCodesJson);\n    var hashedCode = HashHelper.Sha256(code);\n    if (backupCodes.Remove(hashedCode))  // One-time use\n    {\n        admin.BackupCodesJson = JsonSerializer.Serialize(backupCodes);\n        isValid = true;\n    }\n}\n\n// Record for anti-replay\nadmin.LastTwoFactorCodeUsed = code;\nadmin.LastTwoFactorCodeUsedAt = DateTime.UtcNow;",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_29_content"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_30_hdr_0",
      "features.authentication.section_30_hdr_1",
      "features.authentication.section_30_hdr_2"
    ],
    "rows": [
      [
        "features.authentication.section_30_cell_0_0",
        "features.authentication.section_30_cell_0_1",
        "features.authentication.section_30_cell_0_2"
      ],
      [
        "features.authentication.section_30_cell_1_0",
        "features.authentication.section_30_cell_1_1",
        "features.authentication.section_30_cell_1_2"
      ],
      [
        "features.authentication.section_30_cell_2_0",
        "features.authentication.section_30_cell_2_1",
        "features.authentication.section_30_cell_2_2"
      ],
      [
        "features.authentication.section_30_cell_3_0",
        "features.authentication.section_30_cell_3_1",
        "features.authentication.section_30_cell_3_2"
      ],
      [
        "features.authentication.section_30_cell_4_0",
        "features.authentication.section_30_cell_4_1",
        "features.authentication.section_30_cell_4_2"
      ],
      [
        "features.authentication.section_30_cell_5_0",
        "features.authentication.section_30_cell_5_1",
        "features.authentication.section_30_cell_5_2"
      ],
      [
        "features.authentication.section_30_cell_6_0",
        "features.authentication.section_30_cell_6_1",
        "features.authentication.section_30_cell_6_2"
      ],
      [
        "features.authentication.section_30_cell_7_0",
        "features.authentication.section_30_cell_7_1",
        "features.authentication.section_30_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_32_hdr_0",
      "features.authentication.section_32_hdr_1",
      "features.authentication.section_32_hdr_2",
      "features.authentication.section_32_hdr_3",
      "features.authentication.section_32_hdr_4"
    ],
    "rows": [
      [
        "features.authentication.section_32_cell_0_0",
        "features.authentication.section_32_cell_0_1",
        "features.authentication.section_32_cell_0_2",
        "features.authentication.section_32_cell_0_3",
        "features.authentication.section_32_cell_0_4"
      ],
      [
        "features.authentication.section_32_cell_1_0",
        "features.authentication.section_32_cell_1_1",
        "features.authentication.section_32_cell_1_2",
        "features.authentication.section_32_cell_1_3",
        "features.authentication.section_32_cell_1_4"
      ],
      [
        "features.authentication.section_32_cell_2_0",
        "features.authentication.section_32_cell_2_1",
        "features.authentication.section_32_cell_2_2",
        "features.authentication.section_32_cell_2_3",
        "features.authentication.section_32_cell_2_4"
      ],
      [
        "features.authentication.section_32_cell_3_0",
        "features.authentication.section_32_cell_3_1",
        "features.authentication.section_32_cell_3_2",
        "features.authentication.section_32_cell_3_3",
        "features.authentication.section_32_cell_3_4"
      ],
      [
        "features.authentication.section_32_cell_4_0",
        "features.authentication.section_32_cell_4_1",
        "features.authentication.section_32_cell_4_2",
        "features.authentication.section_32_cell_4_3",
        "features.authentication.section_32_cell_4_4"
      ],
      [
        "features.authentication.section_32_cell_5_0",
        "features.authentication.section_32_cell_5_1",
        "features.authentication.section_32_cell_5_2",
        "features.authentication.section_32_cell_5_3",
        "features.authentication.section_32_cell_5_4"
      ],
      [
        "features.authentication.section_32_cell_6_0",
        "features.authentication.section_32_cell_6_1",
        "features.authentication.section_32_cell_6_2",
        "features.authentication.section_32_cell_6_3",
        "features.authentication.section_32_cell_6_4"
      ],
      [
        "features.authentication.section_32_cell_7_0",
        "features.authentication.section_32_cell_7_1",
        "features.authentication.section_32_cell_7_2",
        "features.authentication.section_32_cell_7_3",
        "features.authentication.section_32_cell_7_4"
      ],
      [
        "features.authentication.section_32_cell_8_0",
        "features.authentication.section_32_cell_8_1",
        "features.authentication.section_32_cell_8_2",
        "features.authentication.section_32_cell_8_3",
        "features.authentication.section_32_cell_8_4"
      ],
      [
        "features.authentication.section_32_cell_9_0",
        "features.authentication.section_32_cell_9_1",
        "features.authentication.section_32_cell_9_2",
        "features.authentication.section_32_cell_9_3",
        "features.authentication.section_32_cell_9_4"
      ],
      [
        "features.authentication.section_32_cell_10_0",
        "features.authentication.section_32_cell_10_1",
        "features.authentication.section_32_cell_10_2",
        "features.authentication.section_32_cell_10_3",
        "features.authentication.section_32_cell_10_4"
      ],
      [
        "features.authentication.section_32_cell_11_0",
        "features.authentication.section_32_cell_11_1",
        "features.authentication.section_32_cell_11_2",
        "features.authentication.section_32_cell_11_3",
        "features.authentication.section_32_cell_11_4"
      ],
      [
        "features.authentication.section_32_cell_12_0",
        "features.authentication.section_32_cell_12_1",
        "features.authentication.section_32_cell_12_2",
        "features.authentication.section_32_cell_12_3",
        "features.authentication.section_32_cell_12_4"
      ],
      [
        "features.authentication.section_32_cell_13_0",
        "features.authentication.section_32_cell_13_1",
        "features.authentication.section_32_cell_13_2",
        "features.authentication.section_32_cell_13_3",
        "features.authentication.section_32_cell_13_4"
      ],
      [
        "features.authentication.section_32_cell_14_0",
        "features.authentication.section_32_cell_14_1",
        "features.authentication.section_32_cell_14_2",
        "features.authentication.section_32_cell_14_3",
        "features.authentication.section_32_cell_14_4"
      ],
      [
        "features.authentication.section_32_cell_15_0",
        "features.authentication.section_32_cell_15_1",
        "features.authentication.section_32_cell_15_2",
        "features.authentication.section_32_cell_15_3",
        "features.authentication.section_32_cell_15_4"
      ],
      [
        "features.authentication.section_32_cell_16_0",
        "features.authentication.section_32_cell_16_1",
        "features.authentication.section_32_cell_16_2",
        "features.authentication.section_32_cell_16_3",
        "features.authentication.section_32_cell_16_4"
      ],
      [
        "features.authentication.section_32_cell_17_0",
        "features.authentication.section_32_cell_17_1",
        "features.authentication.section_32_cell_17_2",
        "features.authentication.section_32_cell_17_3",
        "features.authentication.section_32_cell_17_4"
      ],
      [
        "features.authentication.section_32_cell_18_0",
        "features.authentication.section_32_cell_18_1",
        "features.authentication.section_32_cell_18_2",
        "features.authentication.section_32_cell_18_3",
        "features.authentication.section_32_cell_18_4"
      ],
      [
        "features.authentication.section_32_cell_19_0",
        "features.authentication.section_32_cell_19_1",
        "features.authentication.section_32_cell_19_2",
        "features.authentication.section_32_cell_19_3",
        "features.authentication.section_32_cell_19_4"
      ],
      [
        "features.authentication.section_32_cell_20_0",
        "features.authentication.section_32_cell_20_1",
        "features.authentication.section_32_cell_20_2",
        "features.authentication.section_32_cell_20_3",
        "features.authentication.section_32_cell_20_4"
      ],
      [
        "features.authentication.section_32_cell_21_0",
        "features.authentication.section_32_cell_21_1",
        "features.authentication.section_32_cell_21_2",
        "features.authentication.section_32_cell_21_3",
        "features.authentication.section_32_cell_21_4"
      ],
      [
        "features.authentication.section_32_cell_22_0",
        "features.authentication.section_32_cell_22_1",
        "features.authentication.section_32_cell_22_2",
        "features.authentication.section_32_cell_22_3",
        "features.authentication.section_32_cell_22_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_34_hdr_0",
      "features.authentication.section_34_hdr_1",
      "features.authentication.section_34_hdr_2",
      "features.authentication.section_34_hdr_3",
      "features.authentication.section_34_hdr_4"
    ],
    "rows": [
      [
        "features.authentication.section_34_cell_0_0",
        "features.authentication.section_34_cell_0_1",
        "features.authentication.section_34_cell_0_2",
        "features.authentication.section_34_cell_0_3",
        "features.authentication.section_34_cell_0_4"
      ],
      [
        "features.authentication.section_34_cell_1_0",
        "features.authentication.section_34_cell_1_1",
        "features.authentication.section_34_cell_1_2",
        "features.authentication.section_34_cell_1_3",
        "features.authentication.section_34_cell_1_4"
      ],
      [
        "features.authentication.section_34_cell_2_0",
        "features.authentication.section_34_cell_2_1",
        "features.authentication.section_34_cell_2_2",
        "features.authentication.section_34_cell_2_3",
        "features.authentication.section_34_cell_2_4"
      ],
      [
        "features.authentication.section_34_cell_3_0",
        "features.authentication.section_34_cell_3_1",
        "features.authentication.section_34_cell_3_2",
        "features.authentication.section_34_cell_3_3",
        "features.authentication.section_34_cell_3_4"
      ],
      [
        "features.authentication.section_34_cell_4_0",
        "features.authentication.section_34_cell_4_1",
        "features.authentication.section_34_cell_4_2",
        "features.authentication.section_34_cell_4_3",
        "features.authentication.section_34_cell_4_4"
      ],
      [
        "features.authentication.section_34_cell_5_0",
        "features.authentication.section_34_cell_5_1",
        "features.authentication.section_34_cell_5_2",
        "features.authentication.section_34_cell_5_3",
        "features.authentication.section_34_cell_5_4"
      ],
      [
        "features.authentication.section_34_cell_6_0",
        "features.authentication.section_34_cell_6_1",
        "features.authentication.section_34_cell_6_2",
        "features.authentication.section_34_cell_6_3",
        "features.authentication.section_34_cell_6_4"
      ],
      [
        "features.authentication.section_34_cell_7_0",
        "features.authentication.section_34_cell_7_1",
        "features.authentication.section_34_cell_7_2",
        "features.authentication.section_34_cell_7_3",
        "features.authentication.section_34_cell_7_4"
      ],
      [
        "features.authentication.section_34_cell_8_0",
        "features.authentication.section_34_cell_8_1",
        "features.authentication.section_34_cell_8_2",
        "features.authentication.section_34_cell_8_3",
        "features.authentication.section_34_cell_8_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "paragraph",
    "contentKey": "features.authentication.section_36_content"
  },
  {
    "type": "table",
    "headers": [
      "features.authentication.section_37_hdr_0",
      "features.authentication.section_37_hdr_1",
      "features.authentication.section_37_hdr_2",
      "features.authentication.section_37_hdr_3"
    ],
    "rows": [
      [
        "features.authentication.section_37_cell_0_0",
        "features.authentication.section_37_cell_0_1",
        "features.authentication.section_37_cell_0_2",
        "features.authentication.section_37_cell_0_3"
      ],
      [
        "features.authentication.section_37_cell_1_0",
        "features.authentication.section_37_cell_1_1",
        "features.authentication.section_37_cell_1_2",
        "features.authentication.section_37_cell_1_3"
      ],
      [
        "features.authentication.section_37_cell_2_0",
        "features.authentication.section_37_cell_2_1",
        "features.authentication.section_37_cell_2_2",
        "features.authentication.section_37_cell_2_3"
      ],
      [
        "features.authentication.section_37_cell_3_0",
        "features.authentication.section_37_cell_3_1",
        "features.authentication.section_37_cell_3_2",
        "features.authentication.section_37_cell_3_3"
      ],
      [
        "features.authentication.section_37_cell_4_0",
        "features.authentication.section_37_cell_4_1",
        "features.authentication.section_37_cell_4_2",
        "features.authentication.section_37_cell_4_3"
      ],
      [
        "features.authentication.section_37_cell_5_0",
        "features.authentication.section_37_cell_5_1",
        "features.authentication.section_37_cell_5_2",
        "features.authentication.section_37_cell_5_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.authentication.section_38_title",
    "contentKey": "features.authentication.section_38_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.authentication.section_39_title",
    "id": "sec_39"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.authentication.section_40_item_0",
      "features.authentication.section_40_item_1",
      "features.authentication.section_40_item_2"
    ]
  }
],
  relatedSlugs: [
  "features/role-permissions",
  "features/audit-system",
  "security/authentication-deep"
],
  lastUpdated: "2026-06-09",
});
