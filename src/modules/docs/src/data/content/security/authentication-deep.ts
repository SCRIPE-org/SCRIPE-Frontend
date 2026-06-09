import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "security/authentication-deep",
  titleKey: "security.authDeep.title",
  category: "security",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    login([\"POST /auth/login\"])\n    route([\"Route Decision\"])\n    %% route: Inspect tenantId & isPlatformAdmin\n    caseA([\"Case A: Tenant-Scoped\"])\n    %% caseA: tenantId present → strict isolation\n    caseAp([\"Case A': Platform Admin\"])\n    %% caseAp: isPlatformAdmin=true → TenantId=null lookup\n    caseB{{\"Case B: Discovery\"}}\n    %% caseB: No tenantId → search all tenants\n    found0[\"0 Matches\"]\n    %% found0: Invalid credentials\n    found1([\"1 Match\"])\n    %% found1: Direct auth for that tenant\n    foundN([\"N Matches\"])\n    %% foundN: Return workspace list\n    picker([\"Workspace Picker (Frontend)\"])\n    relogin([\"Re-login with tenantId\"])\n    auth([\"Authenticate\"])\n    login --> route\n    route -->|\"has tenantId\"| caseA\n    route -->|\"isPlatformAdmin\"| caseAp\n    route -->|\"neither\"| caseB\n    caseA --> auth\n    caseAp --> auth\n    caseB -->|\"no results\"| found0\n    caseB -->|\"exact one\"| found1\n    caseB -->|\"multiple\"| foundN\n    found1 --> auth\n    foundN --> picker\n    picker --> relogin\n    relogin -.-> caseA",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_5_hdr_0",
      "security.authDeep.section_5_hdr_1",
      "security.authDeep.section_5_hdr_2"
    ],
    "rows": [
      [
        "security.authDeep.section_5_cell_0_0",
        "security.authDeep.section_5_cell_0_1",
        "security.authDeep.section_5_cell_0_2"
      ],
      [
        "security.authDeep.section_5_cell_1_0",
        "security.authDeep.section_5_cell_1_1",
        "security.authDeep.section_5_cell_1_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "security.authDeep.section_6_title",
    "contentKey": "security.authDeep.section_6_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_8_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    login([\"POST /auth/login\"])\n    validate{{\"Validate Credentials\"}}\n    %% validate: BCrypt verify + account checks\n    pwExpiry{{\"Password Expiry Check\"}}\n    %% pwExpiry: ITenantPasswordValidator → MustChangePassword\n    issue([\"Issue Token Pair\"])\n    %% issue: Access (15min) + Refresh (7d)\n    use([\"API Requests\"])\n    %% use: Bearer token in Authorization header\n    expire[\"Access Token Expires\"]\n    refresh([\"POST /auth/refresh\"])\n    reissue([\"New Token Pair\"])\n    %% reissue: Old refresh token revoked\n    logout[\"POST /auth/logout\"]\n    %% logout: Revoke all tokens\n    login --> validate\n    validate --> pwExpiry\n    pwExpiry -->|\"not expired\"| issue\n    issue --> use\n    use -->|\"after 15min\"| expire\n    expire --> refresh\n    refresh --> reissue\n    reissue -.->|\"continue\"| use\n    use --> logout",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.authDeep.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_11_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"sub\": \"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\n  \"email\": \"admin@company.com\",\n  \"given_name\": \"John\",\n  \"family_name\": \"Doe\",\n  \"role\": \"SuperAdmin\",\n  \"permissions\": [\n    \"admins.view\", \"admins.create\", \"admins.update\",\n    \"users.view\", \"users.create\", \"roles.manage\"\n  ],\n  \"tenant_id\": \"f8e7d6c5-b4a3-2190-fedc-ba0987654321\",\n  \"is_admin\": \"true\",\n  \"impersonator_id\": null,\n  \"iat\": 1708444800,\n  \"exp\": 1708445700,\n  \"iss\": \"scripe-api\",\n  \"aud\": \"scripe-client\"\n}",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_13_hdr_0",
      "security.authDeep.section_13_hdr_1",
      "security.authDeep.section_13_hdr_2"
    ],
    "rows": [
      [
        "security.authDeep.section_13_cell_0_0",
        "security.authDeep.section_13_cell_0_1",
        "security.authDeep.section_13_cell_0_2"
      ],
      [
        "security.authDeep.section_13_cell_1_0",
        "security.authDeep.section_13_cell_1_1",
        "security.authDeep.section_13_cell_1_2"
      ],
      [
        "security.authDeep.section_13_cell_2_0",
        "security.authDeep.section_13_cell_2_1",
        "security.authDeep.section_13_cell_2_2"
      ],
      [
        "security.authDeep.section_13_cell_3_0",
        "security.authDeep.section_13_cell_3_1",
        "security.authDeep.section_13_cell_3_2"
      ],
      [
        "security.authDeep.section_13_cell_4_0",
        "security.authDeep.section_13_cell_4_1",
        "security.authDeep.section_13_cell_4_2"
      ],
      [
        "security.authDeep.section_13_cell_5_0",
        "security.authDeep.section_13_cell_5_1",
        "security.authDeep.section_13_cell_5_2"
      ],
      [
        "security.authDeep.section_13_cell_6_0",
        "security.authDeep.section_13_cell_6_1",
        "security.authDeep.section_13_cell_6_2"
      ],
      [
        "security.authDeep.section_13_cell_7_0",
        "security.authDeep.section_13_cell_7_1",
        "security.authDeep.section_13_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Hash password with BCrypt (work factor = 12)\n// ~250ms per hash — intentionally slow to resist brute force\nvar hashedPassword = BCrypt.Net.BCrypt.HashPassword(\n    plainPassword,\n    workFactor: 12  // 2^12 = 4,096 iterations\n);\n\n// Verify password during login\nvar isValid = BCrypt.Net.BCrypt.Verify(plainPassword, storedHash);\n// Returns true/false — constant-time comparison prevents timing attacks",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_18_hdr_0",
      "security.authDeep.section_18_hdr_1",
      "security.authDeep.section_18_hdr_2",
      "security.authDeep.section_18_hdr_3"
    ],
    "rows": [
      [
        "security.authDeep.section_18_cell_0_0",
        "security.authDeep.section_18_cell_0_1",
        "security.authDeep.section_18_cell_0_2",
        "security.authDeep.section_18_cell_0_3"
      ],
      [
        "security.authDeep.section_18_cell_1_0",
        "security.authDeep.section_18_cell_1_1",
        "security.authDeep.section_18_cell_1_2",
        "security.authDeep.section_18_cell_1_3"
      ],
      [
        "security.authDeep.section_18_cell_2_0",
        "security.authDeep.section_18_cell_2_1",
        "security.authDeep.section_18_cell_2_2",
        "security.authDeep.section_18_cell_2_3"
      ],
      [
        "security.authDeep.section_18_cell_3_0",
        "security.authDeep.section_18_cell_3_1",
        "security.authDeep.section_18_cell_3_2",
        "security.authDeep.section_18_cell_3_3"
      ],
      [
        "security.authDeep.section_18_cell_4_0",
        "security.authDeep.section_18_cell_4_1",
        "security.authDeep.section_18_cell_4_2",
        "security.authDeep.section_18_cell_4_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_20_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    attempt([\"Login Attempt\"])\n    check([\"Check Lockout Status\"])\n    locked[\"Account Locked\"]\n    %% locked: Return 423 Locked\n    verify{{\"Verify Password\"}}\n    fail[\"Wrong Password\"]\n    %% fail: Increment FailedCount\n    threshold{{\"FailedCount >= 5?\"}}\n    lock[\"Lock Account (5 min)\"]\n    success([\"Login Success\"])\n    %% success: Reset FailedCount\n    attempt --> check\n    check -->|\"is locked\"| locked\n    check -->|\"not locked\"| verify\n    verify -->|\"wrong\"| fail\n    verify -->|\"correct\"| success\n    fail --> threshold\n    threshold -->|\"yes\"| lock\n    threshold -.->|\"no\"| attempt",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_22_hdr_0",
      "security.authDeep.section_22_hdr_1",
      "security.authDeep.section_22_hdr_2"
    ],
    "rows": [
      [
        "security.authDeep.section_22_cell_0_0",
        "security.authDeep.section_22_cell_0_1",
        "security.authDeep.section_22_cell_0_2"
      ],
      [
        "security.authDeep.section_22_cell_1_0",
        "security.authDeep.section_22_cell_1_1",
        "security.authDeep.section_22_cell_1_2"
      ],
      [
        "security.authDeep.section_22_cell_2_0",
        "security.authDeep.section_22_cell_2_1",
        "security.authDeep.section_22_cell_2_2"
      ],
      [
        "security.authDeep.section_22_cell_3_0",
        "security.authDeep.section_22_cell_3_1",
        "security.authDeep.section_22_cell_3_2"
      ],
      [
        "security.authDeep.section_22_cell_4_0",
        "security.authDeep.section_22_cell_4_1",
        "security.authDeep.section_22_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_24_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    enable([\"POST /auth/2fa/enable\"])\n    %% enable: Generate TOTP secret + QR code\n    qr([\"Display QR Code\"])\n    %% qr: User scans with authenticator app\n    confirm{{\"POST /auth/2fa/confirm\"}}\n    %% confirm: User enters 6-digit code to verify setup\n    backup([\"Generate Backup Codes\"])\n    %% backup: 10 one-time-use recovery codes\n    active([\"2FA Active\"])\n    login([\"Login Attempt\"])\n    verify{{\"POST /auth/2fa/verify\"}}\n    %% verify: Enter TOTP code or backup code\n    granted([\"Access Granted\"])\n    enable --> qr\n    qr --> confirm\n    confirm --> backup\n    backup --> active\n    login -->|\"if 2FA enabled\"| verify\n    verify -->|\"valid code\"| granted",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_26_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class TfaService : ITfaService\n{\n    private const int SecretLength = 20;     // 160-bit secret\n    private const int CodeLength = 6;        // 6-digit TOTP\n    private const int TimeStep = 30;         // 30-second window\n    private const int BackupCodeCount = 10;  // 10 backup codes\n\n    public TfaSetupResult EnableTfa(string userId)\n    {\n        // 1. Generate random secret\n        var secretBytes = RandomNumberGenerator.GetBytes(SecretLength);\n        var secret = Base32Encoding.ToString(secretBytes);\n\n        // 2. Generate QR code URI (otpauth:// format)\n        var uri = $\"otpauth://totp/SCRIPE:{userId}?secret={secret}&issuer=SCRIPE\";\n\n        // 3. Generate backup codes\n        var backupCodes = Enumerable.Range(0, BackupCodeCount)\n            .Select(_ => GenerateBackupCode())\n            .ToList();\n\n        return new TfaSetupResult(secret, uri, backupCodes);\n    }\n\n    public bool VerifyCode(string secret, string code)\n    {\n        // Validate TOTP with ±1 time step tolerance\n        var totp = new Totp(Base32Encoding.ToBytes(secret),\n            step: TimeStep, totpSize: CodeLength);\n\n        return totp.VerifyTotp(code, out _, new VerificationWindow(1, 1));\n    }\n\n    private static string GenerateBackupCode()\n        => $\"{Random.Shared.Next(10000000, 99999999)}\"; // 8-digit\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_29_content"
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_30_hdr_0",
      "security.authDeep.section_30_hdr_1",
      "security.authDeep.section_30_hdr_2"
    ],
    "rows": [
      [
        "security.authDeep.section_30_cell_0_0",
        "security.authDeep.section_30_cell_0_1",
        "security.authDeep.section_30_cell_0_2"
      ],
      [
        "security.authDeep.section_30_cell_1_0",
        "security.authDeep.section_30_cell_1_1",
        "security.authDeep.section_30_cell_1_2"
      ],
      [
        "security.authDeep.section_30_cell_2_0",
        "security.authDeep.section_30_cell_2_1",
        "security.authDeep.section_30_cell_2_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "security.authDeep.section_31_title",
    "contentKey": "security.authDeep.section_31_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_33_content"
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_34_hdr_0",
      "security.authDeep.section_34_hdr_1",
      "security.authDeep.section_34_hdr_2",
      "security.authDeep.section_34_hdr_3"
    ],
    "rows": [
      [
        "security.authDeep.section_34_cell_0_0",
        "security.authDeep.section_34_cell_0_1",
        "security.authDeep.section_34_cell_0_2",
        "security.authDeep.section_34_cell_0_3"
      ],
      [
        "security.authDeep.section_34_cell_1_0",
        "security.authDeep.section_34_cell_1_1",
        "security.authDeep.section_34_cell_1_2",
        "security.authDeep.section_34_cell_1_3"
      ],
      [
        "security.authDeep.section_34_cell_2_0",
        "security.authDeep.section_34_cell_2_1",
        "security.authDeep.section_34_cell_2_2",
        "security.authDeep.section_34_cell_2_3"
      ],
      [
        "security.authDeep.section_34_cell_3_0",
        "security.authDeep.section_34_cell_3_1",
        "security.authDeep.section_34_cell_3_2",
        "security.authDeep.section_34_cell_3_3"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_35_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class ExternalAuthService : IExternalAuthService\n{\n    public async Task<ExternalUserInfo?> ValidateTokenAsync(\n        string provider, string token)\n    {\n        return provider.ToLower() switch\n        {\n            \"google\" => await ValidateGoogleTokenAsync(token),\n            \"facebook\" => await ValidateFacebookTokenAsync(token),\n            \"apple\" => await ValidateAppleTokenAsync(token),\n            \"microsoft\" => await ValidateMicrosoftTokenAsync(token),\n            _ => throw new ArgumentException($\"Unknown provider: {provider}\")\n        };\n    }\n}\n\n// Returned user info for account linking/creation\npublic record ExternalUserInfo(\n    string ProviderId,     // Provider's unique user ID\n    string Email,\n    string? FirstName,\n    string? LastName,\n    string? AvatarUrl,\n    string Provider        // \"google\", \"facebook\", etc.\n);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_38_content"
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_39_hdr_0",
      "security.authDeep.section_39_hdr_1",
      "security.authDeep.section_39_hdr_2",
      "security.authDeep.section_39_hdr_3",
      "security.authDeep.section_39_hdr_4"
    ],
    "rows": [
      [
        "security.authDeep.section_39_cell_0_0",
        "security.authDeep.section_39_cell_0_1",
        "security.authDeep.section_39_cell_0_2",
        "security.authDeep.section_39_cell_0_3",
        "security.authDeep.section_39_cell_0_4"
      ],
      [
        "security.authDeep.section_39_cell_1_0",
        "security.authDeep.section_39_cell_1_1",
        "security.authDeep.section_39_cell_1_2",
        "security.authDeep.section_39_cell_1_3",
        "security.authDeep.section_39_cell_1_4"
      ],
      [
        "security.authDeep.section_39_cell_2_0",
        "security.authDeep.section_39_cell_2_1",
        "security.authDeep.section_39_cell_2_2",
        "security.authDeep.section_39_cell_2_3",
        "security.authDeep.section_39_cell_2_4"
      ],
      [
        "security.authDeep.section_39_cell_3_0",
        "security.authDeep.section_39_cell_3_1",
        "security.authDeep.section_39_cell_3_2",
        "security.authDeep.section_39_cell_3_3",
        "security.authDeep.section_39_cell_3_4"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_40_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class OtpService : IOtpService\n{\n    public async Task<string> GenerateAsync(\n        string userId, OtpPurpose purpose, CancellationToken ct)\n    {\n        // 1. Invalidate any existing OTP for this user+purpose\n        await _repository.InvalidateExistingAsync(userId, purpose, ct);\n\n        // 2. Generate cryptographically random 6-digit code\n        var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();\n\n        // 3. Store hashed code (never store plaintext)\n        var otpCode = new OtpCode\n        {\n            UserId = userId,\n            Purpose = purpose,\n            CodeHash = BCrypt.Net.BCrypt.HashPassword(code),\n            ExpiresAt = DateTime.UtcNow.AddMinutes(15),\n            RemainingAttempts = 3\n        };\n\n        await _repository.AddAsync(otpCode, ct);\n        return code; // Return plaintext to send via email/SMS\n    }\n\n    public async Task<bool> VerifyAsync(\n        string userId, string code, OtpPurpose purpose, CancellationToken ct)\n    {\n        var otp = await _repository.GetLatestAsync(userId, purpose, ct);\n        if (otp is null || otp.ExpiresAt < DateTime.UtcNow) return false;\n        if (otp.RemainingAttempts <= 0) return false;\n\n        var isValid = BCrypt.Net.BCrypt.Verify(code, otp.CodeHash);\n        if (!isValid)\n        {\n            otp.RemainingAttempts--;\n            await _repository.SaveChangesAsync(ct);\n            return false;\n        }\n\n        // Mark as used\n        otp.UsedAt = DateTime.UtcNow;\n        await _repository.SaveChangesAsync(ct);\n        return true;\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_42_title",
    "id": "sec_42"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_43_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    super([\"SuperAdmin\"])\n    impersonate{{\"POST /admins/{id}/impersonate\"}}\n    check[\"Security Checks\"]\n    %% check: Can't impersonate protected/superior admins\n    token([\"Issue Impersonation Token\"])\n    %% token: Claims of target + impersonator_id claim\n    act([\"Act as Target Admin\"])\n    stop([\"POST /admins/stop-impersonation\"])\n    restore([\"Restore Original Token\"])\n    super --> impersonate\n    impersonate --> check\n    check -->|\"allowed\"| token\n    token --> act\n    act --> stop\n    stop --> restore",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "danger",
    "titleKey": "security.authDeep.section_45_title",
    "contentKey": "security.authDeep.section_45_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_46_title",
    "id": "sec_46"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_47_content"
  },
  {
    "type": "table",
    "headers": [
      "security.authDeep.section_48_hdr_0",
      "security.authDeep.section_48_hdr_1",
      "security.authDeep.section_48_hdr_2",
      "security.authDeep.section_48_hdr_3"
    ],
    "rows": [
      [
        "security.authDeep.section_48_cell_0_0",
        "security.authDeep.section_48_cell_0_1",
        "security.authDeep.section_48_cell_0_2",
        "security.authDeep.section_48_cell_0_3"
      ],
      [
        "security.authDeep.section_48_cell_1_0",
        "security.authDeep.section_48_cell_1_1",
        "security.authDeep.section_48_cell_1_2",
        "security.authDeep.section_48_cell_1_3"
      ],
      [
        "security.authDeep.section_48_cell_2_0",
        "security.authDeep.section_48_cell_2_1",
        "security.authDeep.section_48_cell_2_2",
        "security.authDeep.section_48_cell_2_3"
      ],
      [
        "security.authDeep.section_48_cell_3_0",
        "security.authDeep.section_48_cell_3_1",
        "security.authDeep.section_48_cell_3_2",
        "security.authDeep.section_48_cell_3_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "security.authDeep.section_49_title",
    "contentKey": "security.authDeep.section_49_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_50_title",
    "id": "sec_50"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_51_content"
  },
  {
    "type": "info",
    "variant": "danger",
    "titleKey": "security.authDeep.section_52_title",
    "contentKey": "security.authDeep.section_52_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_53_title",
    "id": "sec_53"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_54_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_55_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"id\": \"AR9...xCQ\",\n  \"rawId\": \"AR9...xCQ\",\n  \"type\": \"public-key\",\n  \"response\": {\n    \"clientDataJSON\": \"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoi...\",\n    \"attestationObject\": \"o2NmbXRkbm9uZWdhdHRTdG10XGhhdXRoRGF0YVj...\",\n    \"transports\": [\"internal\", \"hybrid\"]\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_57_title",
    "id": "sec_57"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_58_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_59_content"
  },
  {
    "type": "code",
    "language": "xml",
    "code": "<samlp:AuthnRequest xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\"\n                    ID=\"_a1b2c3d4-e5f6-7890-abcd-ef1234567890\"\n                    Version=\"2.0\"\n                    IssueInstant=\"2026-06-04T12:00:00Z\"\n                    Destination=\"https://idp.example.com/sso\"\n                    AssertionConsumerServiceURL=\"https://scripe.example.com/api/v1/auth/saml/acs/123\">\n  <saml:Issuer xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\">https://scripe.example.com/sp</saml:Issuer>\n  <samlp:NameIDPolicy Format=\"urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress\" AllowCreate=\"true\"/>\n</samlp:AuthnRequest>",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_61_title",
    "id": "sec_61"
  },
  {
    "type": "paragraph",
    "contentKey": "security.authDeep.section_62_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    req([\"Web Client: POST /qr-login/session\"])\n    qr([\"Render QR Code\"])\n    %% qr: Contains SessionId & TenantId\n    poll{{\"Web Client: Poll /qr-login/poll/{sessionId}\"}}\n    scan([\"Mobile App: Scan QR Code\"])\n    confirm{{\"Mobile App: POST /qr-login/confirm\"}}\n    %% confirm: Submits session signature + user JWT\n    ok([\"Poll Returns 200 Success\"])\n    %% ok: Issues new JWT to Web Client\n    req --> qr\n    qr --> poll\n    qr -.-> scan\n    scan --> confirm\n    confirm --> ok",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.authDeep.section_64_title",
    "id": "sec_64"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "security.authDeep.section_65_item_0",
      "security.authDeep.section_65_item_1",
      "security.authDeep.section_65_item_2",
      "security.authDeep.section_65_item_3"
    ]
  }
],
  relatedSlugs: [
  "security/overview",
  "security/data-protection",
  "security/api-security",
  "features/authentication"
],
  lastUpdated: "2026-06-09",
});
