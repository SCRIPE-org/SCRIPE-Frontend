import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.mediaDam.intro" },
  {
    type: "stats-strip-block",
    stats: [
      { value: "4 Backends", labelKey: "commercial.mediaDam.statBackends" },
      { value: "100%", labelKey: "commercial.mediaDam.statVirusScan" },
      { value: "Signed URLs", labelKey: "commercial.mediaDam.statSignedUrls" },
      { value: "Chunked", labelKey: "commercial.mediaDam.statUploads" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.mediaDam.valueTitle",
    id: "business-value",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Folder",
        titleKey: "commercial.mediaDam.featFolderTaxonomy",
        descriptionKey: "commercial.mediaDam.featFolderTaxonomyDesc",
      },
      {
        icon: "UploadCloud",
        titleKey: "commercial.mediaDam.featResumableUploads",
        descriptionKey: "commercial.mediaDam.featResumableUploadsDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "commercial.mediaDam.featAutomatedSecurity",
        descriptionKey: "commercial.mediaDam.featAutomatedSecurityDesc",
      },
      {
        icon: "Key",
        titleKey: "commercial.mediaDam.featDelegatedGrants",
        descriptionKey: "commercial.mediaDam.featDelegatedGrantsDesc",
      },
      {
        icon: "Globe",
        titleKey: "commercial.mediaDam.featMultiCloudStorage",
        descriptionKey: "commercial.mediaDam.featMultiCloudStorageDesc",
      },
      {
        icon: "Image",
        titleKey: "commercial.mediaDam.featBrandedDelivery",
        descriptionKey: "commercial.mediaDam.featBrandedDeliveryDesc",
      },
    ],
  },
  {
    type: "cta-banner-block",
    titleKey: "commercial.mediaDam.ctaTitle",
    subtitleKey: "commercial.mediaDam.ctaSubtitle",
    primaryCtaKey: "commercial.mediaDam.ctaPrimary",
    primaryCtaHref: "/commercial/pricing-showcase",
    secondaryCtaKey: "commercial.mediaDam.ctaSecondary",
    secondaryCtaHref: "/docs/modules/media-overview",
  },
];

registerPage({
  slug: "commercial/digital-asset-management",
  titleKey: "commercial.mediaDam.title",
  descriptionKey: "commercial.mediaDam.description",
  category: "commercial-modules",
  order: 16,
  sections,
  relatedSlugs: [
    "commercial/custom-fields",
    "commercial/theme-marketplace",
    "commercial/white-labeling",
  ],
  lastUpdated: "2026-10-03",
});
