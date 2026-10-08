/**
 * Custom Fields — Cryptographic Key Management & Envelope Encryption (product documentation).
 *
 * Covers: Multi-version platform keyring, tenant-derived HKDF keys,
 * binary magic frame v2 envelope, AAD binding, and live DB rewrap migration.
 */

import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const K = "modules.customFields.docs.encryption";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: `${K}.intro` },
  {
    type: "info",
    variant: "tip",
    titleKey: `${K}.archNoticeTitle`,
    contentKey: `${K}.archNoticeContent`,
  },

  // ─── Cryptographic Architecture ──────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.archTitle`, id: "cryptographic-architecture" },
  { type: "paragraph", contentKey: `${K}.archIntro` },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      { icon: "key", titleKey: `${K}.featKeyringTitle`, descriptionKey: `${K}.featKeyringDesc` },
      {
        icon: "shield",
        titleKey: `${K}.featDerivationTitle`,
        descriptionKey: `${K}.featDerivationDesc`,
      },
      {
        icon: "layers",
        titleKey: `${K}.featEnvelopeTitle`,
        descriptionKey: `${K}.featEnvelopeDesc`,
      },
      { icon: "lock", titleKey: `${K}.featAadTitle`, descriptionKey: `${K}.featAadDesc` },
      { icon: "refresh", titleKey: `${K}.featRewrapTitle`, descriptionKey: `${K}.featRewrapDesc` },
      { icon: "terminal", titleKey: `${K}.featCliTitle`, descriptionKey: `${K}.featCliDesc` },
    ],
  },

  // ─── Dual-Envelope Split-Key Derivation ──────────────────────
  { type: "heading", level: 2, titleKey: `${K}.dualEnvelopeTitle`, id: "dual-envelope-derivation" },
  { type: "paragraph", contentKey: `${K}.dualEnvelopeIntro` },
  {
    type: "table",
    headers: [`${K}.thComponent`, `${K}.thCustodian`, `${K}.thRole`],
    rows: [
      [`${K}.compPlatformKey`, `${K}.custPlatform`, `${K}.rolePlatformKey`],
      [`${K}.compTenantSecret`, `${K}.custTenantDb`, `${K}.roleTenantSecret`],
      [`${K}.compSplitDek`, `${K}.custRuntimeMemory`, `${K}.roleSplitDek`],
      [`${K}.compAadBinding`, `${K}.custCipherEngine`, `${K}.roleAadBinding`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.autoProvisionTitle`,
    contentKey: `${K}.autoProvisionContent`,
  },

  // ─── Binary Magic Frame v2 Specification ─────────────────────
  { type: "heading", level: 2, titleKey: `${K}.frameTitle`, id: "binary-magic-frame-v2" },
  { type: "paragraph", contentKey: `${K}.frameIntro` },
  {
    type: "table",
    headers: [`${K}.thByteOffset`, `${K}.thField`, `${K}.thLength`, `${K}.thDescription`],
    rows: [
      ["Byte 0", "Version Header", "1 Byte", `${K}.descVersion`],
      ["Bytes 1–4", "Platform Key ID", "4 Bytes (UInt32BE)", `${K}.descPlatformKey`],
      ["Bytes 5–6", "Tenant Key Version", "2 Bytes (UInt16BE)", `${K}.descTenantVersion`],
      ["Bytes 7–18", "AES Initialization Vector (Nonce)", "12 Bytes", `${K}.descNonce`],
      ["Bytes 19–34", "AES-GCM Authentication Tag", "16 Bytes", `${K}.descAuthTag`],
      ["Bytes 35+", "Encrypted Ciphertext Payload", "Variable", `${K}.descCiphertext`],
    ],
  },
  {
    type: "info",
    variant: "note",
    titleKey: `${K}.aadTitle`,
    contentKey: `${K}.aadContent`,
  },

  // ─── Key Lifecycle & Hard Gating ─────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.lifecycleTitle`, id: "key-lifecycle-and-gating" },
  { type: "paragraph", contentKey: `${K}.lifecycleIntro` },
  {
    type: "step-guide",
    steps: [
      { titleKey: `${K}.step1Title`, contentKey: `${K}.step1Content` },
      { titleKey: `${K}.step2Title`, contentKey: `${K}.step2Content` },
      { titleKey: `${K}.step3Title`, contentKey: `${K}.step3Content` },
      { titleKey: `${K}.step4Title`, contentKey: `${K}.step4Content` },
    ],
  },

  // ─── Live Database Rewrap Migration ──────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.rewrapTitle`, id: "live-db-rewrap-migration" },
  { type: "paragraph", contentKey: `${K}.rewrapIntro` },
  {
    type: "table",
    headers: [`${K}.thStrategy`, `${K}.thBehavior`],
    rows: [
      [`${K}.stratLocking`, `${K}.behLocking`],
      [`${K}.stratBatching`, `${K}.behBatching`],
      [`${K}.stratResilience`, `${K}.behResilience`],
      [`${K}.stratObservability`, `${K}.behObservability`],
      [`${K}.stratCluster`, `${K}.behCluster`],
    ],
  },

  // ─── Operator & Developer Tooling ────────────────────────────
  { type: "heading", level: 2, titleKey: `${K}.toolingTitle`, id: "tooling-and-management" },
  { type: "paragraph", contentKey: `${K}.toolingIntro` },
  {
    type: "list",
    variant: "unordered",
    items: [`${K}.toolPortal`, `${K}.toolCli`, `${K}.toolStudio`],
  },
];

registerPage({
  slug: "modules/custom-fields-encryption",
  titleKey: `${K}.title`,
  descriptionKey: `${K}.description`,
  category: "modules",
  order: 8,
  sections,
  relatedSlugs: [
    "modules/custom-fields-security",
    "modules/custom-fields-overview",
    "features/role-permissions",
  ],
  lastUpdated: "2026-09-24",
});
