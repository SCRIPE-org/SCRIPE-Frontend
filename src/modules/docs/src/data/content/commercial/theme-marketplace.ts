import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.themeMarketplace.intro" },

      // ─── Business Value ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.valueTitle", id: "business-value",
      },
      { type: "paragraph", contentKey: "commercial.themeMarketplace.valueContent" },
      {
            type: "table",
            headers: ["Challenge", "Traditional Approach", "With NEXORA Theme Marketplace"],
            rows: [
                  ["Enterprise branding project", "3-6 months with design agency ($15K–$50K)", "60 seconds — browse, preview, apply. Zero cost on Pro+ plans."],
                  ["Multi-tenant brand differentiation", "Custom CSS per tenant (developer required)", "40 unique themes, self-service per tenant. No code."],
                  ["Auth page consistency (login/forgot/reset)", "Manual CSS duplication across 3 pages", "Per-page branding built into every theme — instant."],
                  ["Brand safety for production", "Risky direct CSS edits to live pages", "Draft → Preview → Publish with instant rollback."],
                  ["Upsell opportunities", "No natural upgrade triggers", "Premium themes visible-but-locked for lower tiers — natural upgrade."],
                  ["Dark mode support", "Additional development sprint ($5K–$15K)", "Every theme includes independent dark mode tokens."],
            ],
      },

      // ─── 40 Themes ────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.catalogTitle", id: "catalog",
      },
      { type: "paragraph", contentKey: "commercial.themeMarketplace.catalogContent" },

      // ─── 7 Categories ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.categoriesTitle", id: "categories",
      },
      { type: "paragraph", contentKey: "commercial.themeMarketplace.categoriesContent" },
      {
            type: "table",
            headers: ["Category", "Themes", "Target Market"],
            rows: [
                  ["Corporate", "8", "Financial services, consulting, and enterprise. Authority and trust."],
                  ["Creative", "6", "Agencies, startups, and tech. Energy and innovation."],
                  ["Dark", "6", "Developer tools, media, and gaming. Power and elegance."],
                  ["Minimal", "5", "Productivity tools and SaaS platforms. Clarity and focus."],
                  ["Elegant", "5", "Beauty, fashion, and hospitality. Grace and sophistication."],
                  ["Luxury", "5", "High-end brands and private banking. Exclusivity and prestige."],
                  ["Nature", "5", "Sustainability, wellness, and organic. Authenticity and calm."],
            ],
      },

      // ─── 5-Tier Pricing ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.tierTitle", id: "pricing-tiers",
      },
      { type: "paragraph", contentKey: "commercial.themeMarketplace.tierContent" },
      {
            type: "table",
            headers: ["Tier", "Themes", "Available To", "Design Level"],
            rows: [
                  ["Free", "8", "All editions", "Clean, professional — perfect for quick deployment"],
                  ["Starter", "8", "Starter+ editions", "Rich palettes, premium fonts, gradient backgrounds"],
                  ["Professional", "10", "Pro+ editions", "Glass-morphism, editorial typography, multi-tone overlays"],
                  ["Enterprise", "8", "Enterprise edition", "Cinematic layouts, luxury typography, exclusive dark-mode"],
                  ["Standalone Add-on", "6", "Individual purchase", "Art Deco, Brutalist, Vaporwave — ultra-exclusive"],
            ],
      },

      // ─── Marketplace UX ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.uxTitle", id: "marketplace-ux",
      },
      { type: "paragraph", contentKey: "commercial.themeMarketplace.uxContent" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Rich Browsing", "Animated hero, category filters, tier tabs, search, grid/list toggle, infinite scroll"],
                  ["Real-Time Preview", "Click any theme → fully rendered preview on your actual login page"],
                  ["One-Click Deploy", "Apply copies 50+ tokens into draft → review → publish when ready"],
                  ["Engagement Analytics", "LikesCount and AppliedCount reveal which designs resonate"],
            ],
      },

      // ─── Per-Page Branding ────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.perPageTitle", id: "per-page",
      },
      { type: "paragraph", contentKey: "commercial.themeMarketplace.perPageContent" },

      // ─── Copy-on-Apply Safety ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.safetyTitle", id: "safety",
      },
      { type: "paragraph", contentKey: "commercial.themeMarketplace.safetyContent" },

      // ─── ROI ──────────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.roiTitle", id: "roi",
      },
      {
            type: "table",
            headers: ["Metric", "Without Theme Marketplace", "With Theme Marketplace"],
            rows: [
                  ["Time to branded login", "2-4 weeks (design + development)", "60 seconds (browse + apply)"],
                  ["Cost per tenant branding", "$5,000 – $15,000", "$0 (included in edition)"],
                  ["Brand consistency across pages", "Manual CSS per page", "Automatic per-page branding"],
                  ["Dark mode support", "Additional development sprint", "Built into every theme"],
                  ["Subscription upgrades", "No natural upsell triggers", "Premium themes drive 15-25% upgrade conversions"],
                  ["Design consistency", "Varies by developer skill", "Professional designer-crafted packages"],
            ],
      },

      // ─── Competitive ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "commercial.themeMarketplace.competitiveTitle", id: "competitive",
      },
      {
            type: "table",
            headers: ["Capability", "Auth0 / Okta", "Keycloak", "NEXORA"],
            rows: [
                  ["Theme count", "1 (custom only)", "0 (manual styling)", "40 premium packages"],
                  ["Per-page branding", "No", "No", "Yes (Login + Forgot + Reset)"],
                  ["Dark mode per theme", "No (custom CSS)", "No", "Yes (independent dark tokens)"],
                  ["Edition-gated pricing", "No", "No", "Yes (5-tier model)"],
                  ["No-code deployment", "Partial", "No (requires CSS/FreeMarker)", "Yes (one-click apply)"],
                  ["Copy-on-apply safety", "No (live-linked)", "N/A", "Yes (immutable snapshot)"],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "commercial.themeMarketplace.tip",
      },
];

registerPage({
      slug: "commercial/theme-marketplace",
      titleKey: "commercial.themeMarketplace.title",
      descriptionKey: "commercial.themeMarketplace.description",
      category: "commercial-enterprise",
      order: 8,
      sections,
      relatedSlugs: ["commercial/login-customizer", "commercial/page-builder"],
      lastUpdated: "2026-04-02",
});
