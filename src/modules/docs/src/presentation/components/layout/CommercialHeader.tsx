"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

const NAV_LINKS = [
  { href: "/commercial/why-scripe-overview", labelKey: "nav.commercialWhyScripe" },
  { href: "/commercial/business-client-journeys", labelKey: "nav.commercialPlatform" },
  { href: "/commercial/investor-overview", labelKey: "common.investorLabel" },
  { href: "/commercial/pricing-showcase", labelKey: "nav.commercialPricing" },
];

interface CommercialHeaderProps {
  onSearchOpen: () => void;
  onMobileMenuOpen: () => void;
}

export function CommercialHeader({ onSearchOpen, onMobileMenuOpen }: CommercialHeaderProps) {
  const { t } = useDocsI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`com-header ${scrolled ? "com-header--scrolled" : ""}`}>
      <div className="com-header-inner">
        {/* Logo */}
        <Link href="/commercial/why-scripe-overview" className="com-header-logo">
          <img
            src="/app-logo.png"
            alt="SCRIPE"
            width={32}
            height={32}
            className="inline-block object-contain mr-2"
            style={{ width: "32px", height: "32px" }}
          />
          <span className="com-header-logo-name">SCRIPE</span>
          <span className="com-header-logo-badge">B2B2C SaaS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="com-header-nav" aria-label="Commercial navigation">
          {NAV_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className={`com-nav-link ${pathname === href ? "com-nav-link--active" : ""}`}
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="com-header-actions">
          <Link href="/docs" className="com-header-docs-link">
            {t("common.technicalDocs")}
          </Link>
          <Link href="/commercial/pricing-showcase" className="com-header-cta">
            {t("common.getStarted")}
          </Link>
          <button
            className="com-header-hamburger"
            onClick={onMobileMenuOpen}
            aria-label={t("common.menu")}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
