import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.ujCustomFieldsPlugins.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "tutorials.ujCustomFieldsPlugins.infoTitle",
    contentKey: "tutorials.ujCustomFieldsPlugins.infoContent",
  },

  // ─── Step 1: Defining Field Groups & Value Types ──────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujCustomFieldsPlugins.step1Title",
    id: "step-1-field-groups",
  },
  { type: "paragraph", contentKey: "tutorials.ujCustomFieldsPlugins.step1Desc" },
  {
    type: "code",
    language: "json",
    filename: "Custom Field Definition (POST /api/v1/custom-fields/definitions)",
    code: `{
  "targetEntity": "Venue.Reservation",
  "name": "EmergencyContactPhone",
  "labelKey": "custom.reservation.emergencyPhone",
  "valueType": "Text",
  "isRequired": true,
  "isEncrypted": true,
  "validationRegex": "^\\\\+?[1-9]\\\\d{1,14}\$",
  "fieldGroupId": "fg_safety_protocol"
}`,
  },

  // ─── Step 2: Encrypted Storage & Audit Trails ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujCustomFieldsPlugins.step2Title",
    id: "step-2-encrypted-fields",
  },
  { type: "paragraph", contentKey: "tutorials.ujCustomFieldsPlugins.step2Desc" },

  // ─── Step 3: Marketplace Plugin Installation & Sandboxing ─────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujCustomFieldsPlugins.step3Title",
    id: "step-3-install-plugin",
  },
  { type: "paragraph", contentKey: "tutorials.ujCustomFieldsPlugins.step3Desc" },

  // ─── Step 4: Webhook Subscriptions & HMAC Signature Verification ──
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujCustomFieldsPlugins.step4Title",
    id: "step-4-webhooks-hmac",
  },
  { type: "paragraph", contentKey: "tutorials.ujCustomFieldsPlugins.step4Desc" },
  {
    type: "code",
    language: "typescript",
    filename: "Node.js Webhook Receiver (HMAC-SHA256 Verification)",
    code: `import crypto from "crypto";

export function verifyScripeWebhook(
  rawBody: string,
  signatureHeader: string,
  signingSecret: string
): boolean {
  const computedHash = crypto
    .createHmac("sha256", signingSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "utf8"),
    Buffer.from(signatureHeader, "utf8")
  );
}`,
  },
];

registerPage({
  slug: "tutorials/user-journey-custom-fields-plugins",
  titleKey: "tutorials.ujCustomFieldsPlugins.title",
  descriptionKey: "tutorials.ujCustomFieldsPlugins.description",
  category: "tutorials",
  order: 5,
  sections,
  relatedSlugs: [
    "modules/custom-fields/custom-fields-overview",
    "modules/plugins/plugins-overview",
    "features/webhook-system",
  ],
  lastUpdated: "2026-10-03",
});
