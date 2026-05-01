import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.dataProtection.intro" },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dataProtection.encryptionTitle",
    id: "encryption",
  },
  {
    type: "table",
    headers: ["Layer", "Type", "Implementation"],
    rows: [
      ["Transport", "TLS 1.3", "All API requests encrypted in transit"],
      ["At Rest", "AES-256", "Database TDE (transparent data encryption)"],
      ["Field Level", "AES-256-CBC", "Sensitive fields encrypted individually"],
      ["ID Parameters", "AES encryption", "All entity IDs encrypted in URLs"],
      ["Tokens", "RS256", "JWT tokens with asymmetric signing"],
      ["Passwords", "Bcrypt", "One-way hashing with configurable work factor"],
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dataProtection.fieldProjectionTitle",
    id: "field-projection",
  },
  { type: "paragraph", contentKey: "commercial.dataProtection.fieldProjectionContent" },
  {
    type: "code",
    language: "json",
    filename: "Field Projection Configuration",
    code: `{
  "role": "HR_Viewer",
  "projections": {
    "Employee": {
      "hidden": ["salary", "ssn", "bankAccount", "medicalInfo"],
      "masked": ["phone", "email"],
      "readOnly": ["department", "position"]
    }
  }
}

// API Response for HR_Viewer role:
{
  "name": "John Doe",
  "department": "Engineering",
  "phone": "***-***-4567",     // Masked
  "email": "j***@company.com"  // Masked
  // salary, ssn, bankAccount, medicalInfo → not present
}`,
  },

  { type: "heading", level: 2, titleKey: "commercial.dataProtection.csrfTitle", id: "csrf" },
  { type: "paragraph", contentKey: "commercial.dataProtection.csrfContent" },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dataProtection.replayTitle",
    id: "anti-replay",
  },
  { type: "paragraph", contentKey: "commercial.dataProtection.replayContent" },
  {
    type: "code",
    language: "text",
    filename: "Anti-Replay Protection Flow",
    code: `Client                         Server
  │                               │
  │  Generate Nonce + Timestamp   │
  │  ──────────────────────────>  │
  │                               │  1. Check timestamp within window
  │                               │  2. Check nonce not seen before
  │                               │  3. Store nonce in sliding window
  │                               │  4. Process request
  │  <──────────────────────────  │
  │         Response              │
  │                               │
  │  Replay same request          │
  │  ──────────────────────────>  │
  │                               │  ✗ Nonce already used → 409 Conflict
  │  <──────────────────────────  │
  │     409 Conflict              │`,
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.dataProtection.idEncTitle",
    id: "id-encryption",
  },
  { type: "paragraph", contentKey: "commercial.dataProtection.idEncContent" },
  {
    type: "table",
    headers: ["Aspect", "Without ID Encryption", "With ID Encryption"],
    rows: [
      ["URL example", "/api/users/42", "/api/users/aGVsbG8gd29ybGQ="],
      ["Parameter tampering", "Easy: change 42 to 43", "Impossible: encrypted"],
      ["Data enumeration", "Trivial: iterate 1, 2, 3...", "Prevented: non-sequential"],
      ["Information leakage", "Reveals total record count", "No count information"],
    ],
  },
];

registerPage({
  slug: "commercial/data-protection",
  titleKey: "commercial.dataProtection.title",
  descriptionKey: "commercial.dataProtection.description",
  category: "commercial-security",
  order: 3,
  sections,
  relatedSlugs: ["commercial/security-overview", "commercial/infrastructure-security"],
  lastUpdated: "2026-02-20",
});
