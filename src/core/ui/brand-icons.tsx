// COLOUR EXCEPTION — the one file in src/** that may carry a hex literal:
// third-party marks have a fixed brand colour and must never be themed.

/**
 * BrandIcons — the registry of marks the product does not own: identity
 * providers, Stripe, and the card networks.
 *
 * Every literal below is a vendor's own colour, not a design decision. Google's
 * blue is Google's; re-tinting a federation button to the workspace accent makes
 * it unrecognisable and, for several of these vendors, breaks their brand terms.
 * Everything structural — size, alignment, the protocol fallbacks — is tokenised
 * or inherits currentColor. No new literal belongs here unless it ships with a
 * logo, and nothing in here may carry the Scripe accent: the product accent is
 * workspace-owned (--nx-accent) and is not a fixed hue.
 *
 * A wordmark inside a network mark ("VISA", "AMEX") is part of the logo rather
 * than copy, so it is the one text in the UI that is never translated.
 *
 * Three fixes behind the structure below:
 *   • The 16 marks were 16 hand-copied <svg> elements with drifting attribute
 *     sets — some declared xmlns (meaningless for inline SVG), none were
 *     hidden from assistive tech, several were focusable in IE-era terms. One
 *     wrapper now owns those invariants.
 *   • Azure AD B2C was unreachable: the Microsoft/Azure rule ran first and
 *     swallowed every "azure-ad-b2c" slug, so the B2C mark had never rendered.
 *     B2C is matched before the generic Microsoft family now.
 *   • "ping", "aws" and "duo" were substring matches, so a provider named
 *     "Shipping Portal", "Lawson" or "Arduo" picked up someone else's logo.
 *     Those three match whole tokens only.
 */

import * as React from "react";

interface IconProps {
  slug: string;
  name?: string;
  protocol?: string;
  className?: string;
}

/** Shared canvas: one viewBox, hidden from assistive tech, never a tab stop. */
const Mark = ({
  className,
  fill = "none",
  children,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
);

/** Fallback protocol-specific SVGs */
export const ProtocolIcon = ({
  protocol,
  className = "h-4 w-4 shrink-0",
}: {
  protocol: string;
  className?: string;
}) => {
  const lowerProtocol = protocol.toLowerCase();
  // The three protocol glyphs are line art on currentColor, so they inherit the
  // surrounding ink in both themes instead of pinning a colour.
  const stroke = {
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (lowerProtocol === "saml") {
    return (
      <Mark className={className} {...stroke}>
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </Mark>
    );
  }
  if (lowerProtocol === "oauth2") {
    return (
      <Mark className={className} {...stroke}>
        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </Mark>
    );
  }
  // oidc default
  return (
    <Mark className={className} {...stroke}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </Mark>
  );
};

/** A vendor mark. Size and placement stay entirely with the caller's class. */
export type BrandMark = (props: { className?: string }) => React.ReactElement;

/**
 * Every identity-provider mark the product draws, keyed by the provider id the
 * rest of the app already uses. Callers that know the id render straight out of
 * this map; callers holding only a free-text provider name go through
 * `BrandIcon`, which resolves the id first.
 */
export const IDP_BRAND_MARKS: Readonly<Record<string, BrandMark>> = {
  "azure-ad-b2c": ({ className }) => (
    <Mark className={className}>
      <path
        fill="#0078D4"
        d="M12 2L2 7l2 12 8 3 8-3 2-12-10-5zm0 3.236L19.3 8.4l-1.6 9.6-5.7 2.138-5.7-2.138-1.6-9.6L12 5.236z"
      />
    </Mark>
  ),
  google: ({ className }) => (
    <Mark className={className}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Mark>
  ),
  microsoft: ({ className }) => (
    <Mark className={className}>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </Mark>
  ),
  apple: ({ className }) => (
    <Mark className={className} fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.23-.58 2.94-1.39z" />
    </Mark>
  ),
  github: ({ className }) => (
    <Mark className={className} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </Mark>
  ),
  facebook: ({ className }) => (
    <Mark className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </Mark>
  ),
  okta: ({ className }) => (
    <Mark className={className}>
      <path
        fill="#007DC1"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 17.882a5.882 5.882 0 110-11.764 5.882 5.882 0 010 11.764z"
      />
    </Mark>
  ),
  auth0: ({ className }) => (
    <Mark className={className}>
      <path
        fill="#EB5424"
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.8 15.75l-4.8 1.567-4.8-1.567 1.567-4.822L12 6.683l3.233 4.245L16.8 15.75z"
      />
    </Mark>
  ),
  keycloak: ({ className }) => (
    <Mark className={className}>
      <path
        fill="#4D4D4D"
        d="M11.987 0L0 6.955 3.76 9.1l8.227-4.698 8.228 4.698L24 6.955 11.987 0zM3.76 14.9l-3.76 2.145L11.987 24 24 17.045l-3.785-2.145-8.228 4.698L3.76 14.9zM0 9.6v4.8l3.76 2.145V11.77L0 9.6zm24 0l-3.785 2.17v4.775L24 14.4V9.6z"
      />
    </Mark>
  ),
  ping: ({ className }) => (
    <Mark className={className}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#E91E63" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" fill="#E91E63" />
    </Mark>
  ),
  cognito: ({ className }) => (
    <Mark className={className}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#FF9900" />
      <path
        d="M2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="#FF9900"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Mark>
  ),
  onelogin: ({ className }) => (
    <Mark className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#E41F35" />
      <path d="M8 7v10h3v-7h2v7h3V7H8z" fill="#FFFFFF" />
    </Mark>
  ),
  jumpcloud: ({ className }) => (
    <Mark className={className}>
      <circle cx="12" cy="12" r="10" stroke="#00A3E0" strokeWidth="2.5" />
      <path d="M7 11l5-5 5 5m-10 2l5 5 5-5" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
    </Mark>
  ),
  duo: ({ className }) => (
    <Mark className={className}>
      <circle cx="12" cy="12" r="10" fill="#4AA23A" />
      <path d="M8 8h4a4 4 0 010 8H8V8zm3 3v2h1a1 1 0 000-2h-1z" fill="#FFFFFF" />
    </Mark>
  ),
  cloudflare: ({ className }) => (
    <Mark className={className}>
      <path
        d="M20.25 15.75a4.5 4.5 0 00-4.04-2.825A5.25 5.25 0 006 12.75a3 3 0 00-3 3 3 3 0 003 3h14.25a3 3 0 000-6z"
        fill="#F38020"
      />
    </Mark>
  ),
  salesforce: ({ className }) => (
    <Mark className={className}>
      <path
        fill="#009DDC"
        d="M19.12 11.23a4 4 0 00-3.8-3.08 4 4 0 00-3.6 2.1 5.3 5.3 0 00-8.2 2.65 3.3 3.3 0 00.48 6.5h15.12a3.3 3.3 0 000-6.6l-.12-.57z"
      />
    </Mark>
  ),
};

// Ordered resolution table. First match wins, so the narrow rules (B2C) sit
// above the family rules (Microsoft/Azure) they would otherwise be shadowed by.
type MarkMatcher = {
  /** substring test over "name slug" */
  has: (...needles: string[]) => boolean;
  /** whole-token test over "name slug" split on non-alphanumerics */
  hasToken: (...needles: string[]) => boolean;
  /**
   * token-prefix test — the middle ground the short vendor names need.
   * "ping" must still catch "PingOne" and "pingfederate" while leaving
   * "Shipping Portal" alone, which neither substring nor exact-token can do.
   */
  startsToken: (...needles: string[]) => boolean;
};

const REGISTRY: ReadonlyArray<{ id: string; match: (m: MarkMatcher) => boolean }> = [
  // Before the Microsoft family rule — "azure-ad-b2c" contains "azure".
  { id: "azure-ad-b2c", match: ({ has, hasToken }) => hasToken("b2c") || has("adb2c") },
  { id: "google", match: ({ has }) => has("google") },
  { id: "microsoft", match: ({ has }) => has("microsoft", "entra", "azure") },
  { id: "apple", match: ({ has }) => has("apple") },
  { id: "github", match: ({ has }) => has("github") },
  { id: "facebook", match: ({ has }) => has("facebook") },
  { id: "okta", match: ({ has }) => has("okta") },
  { id: "auth0", match: ({ has }) => has("auth0") },
  { id: "keycloak", match: ({ has }) => has("keycloak") },
  { id: "ping", match: ({ startsToken }) => startsToken("ping") },
  { id: "cognito", match: ({ has, hasToken }) => has("cognito") || hasToken("aws") },
  { id: "onelogin", match: ({ has }) => has("onelogin") },
  { id: "jumpcloud", match: ({ has }) => has("jumpcloud") },
  { id: "duo", match: ({ startsToken }) => startsToken("duo") },
  { id: "cloudflare", match: ({ has }) => has("cloudflare") },
  { id: "salesforce", match: ({ has }) => has("salesforce") },
];

/** Brand logo SVG renderer matching all fixed identities */
export const BrandIcon = ({
  slug,
  name = "",
  protocol = "",
  className = "h-[18px] w-[18px] shrink-0",
}: IconProps) => {
  const haystack = `${name} ${slug}`.toLowerCase();
  const tokens = new Set(haystack.split(/[^a-z0-9]+/).filter(Boolean));

  const matcher: MarkMatcher = {
    has: (...needles) => needles.some((needle) => haystack.includes(needle)),
    hasToken: (...needles) => needles.some((needle) => tokens.has(needle)),
    startsToken: (...needles) =>
      needles.some((needle) => [...tokens].some((token) => token.startsWith(needle))),
  };

  const entry = REGISTRY.find((candidate) => candidate.match(matcher));
  if (entry) {
    const ResolvedMark = IDP_BRAND_MARKS[entry.id];
    return <ResolvedMark className={className} />;
  }

  // Fallbacks based on protocol
  return <ProtocolIcon protocol={protocol || "oidc"} className={className} />;
};

/** Stripe's own mark, for the surfaces that mirror a Stripe account. */
export const StripeMark = ({ className = "h-4 w-4 shrink-0" }: { className?: string }) => (
  <Mark className={className} fill="#635BFF">
    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
  </Mark>
);

// Card networks sit on a 3:2 body rather than the 24-square the provider marks
// use, because that silhouette is half of what makes them readable at 20px.
const CardCanvas = ({
  className,
  label,
  children,
}: {
  className?: string;
  label?: string;
  children: React.ReactNode;
}) => (
  <svg
    viewBox="0 0 24 16"
    className={className}
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
  >
    {children}
  </svg>
);

const CARD_NETWORK_MARKS: Readonly<Record<string, React.ReactNode>> = {
  visa: (
    <>
      <rect width="24" height="16" rx="2" fill="#1434CB" />
      <text
        x="12"
        y="11.6"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.3"
        fill="#FFFFFF"
      >
        VISA
      </text>
    </>
  ),
  // The only network whose mark is purely geometric, so the only one drawn
  // exactly: two interlocking discs with the overlap in its own hue.
  mastercard: (
    <>
      <rect width="24" height="16" rx="2" fill="#231F20" />
      <circle cx="10" cy="8" r="4.6" fill="#EB001B" />
      <circle cx="14" cy="8" r="4.6" fill="#F79E1B" />
      <path d="M12 4.35a4.6 4.6 0 000 7.3 4.6 4.6 0 000-7.3z" fill="#FF5F00" />
    </>
  ),
  amex: (
    <>
      <rect width="24" height="16" rx="2" fill="#1F72CD" />
      <text
        x="12"
        y="10.9"
        textAnchor="middle"
        fontSize="5.4"
        fontWeight="700"
        letterSpacing="0.2"
        fill="#FFFFFF"
      >
        AMEX
      </text>
    </>
  ),
  discover: (
    <>
      <rect width="24" height="16" rx="2" fill="#FF6000" />
      <text
        x="12"
        y="10.2"
        textAnchor="middle"
        fontSize="3.6"
        fontWeight="700"
        letterSpacing="0.1"
        fill="#FFFFFF"
      >
        DISCOVER
      </text>
    </>
  ),
};

// An unrecognised network gets the card silhouette in the caller's own ink —
// a shape, not a brand claim, and the one mark here with no literal in it.
const GENERIC_CARD_MARK = (
  <>
    <rect
      x="0.6"
      y="0.6"
      width="22.8"
      height="14.8"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path d="M0.6 5.6h22.8" stroke="currentColor" strokeWidth="1.2" />
  </>
);

// Gateways spell the same network several ways ("amex", "American Express"), so
// the id is normalised to letters and digits before the lookup.
const CARD_BRAND_ALIASES: Readonly<Record<string, string>> = {
  visa: "visa",
  visadebit: "visa",
  visaelectron: "visa",
  mastercard: "mastercard",
  master: "mastercard",
  mc: "mastercard",
  maestro: "mastercard",
  amex: "amex",
  americanexpress: "amex",
  discover: "discover",
};

/**
 * A payment-card network mark. Pass `label` (translated) when the network is
 * information the user needs; leave it off when the card number beside it
 * already says which card this is.
 */
export const CardBrandMark = ({
  brand,
  label,
  className = "h-4 w-6 shrink-0",
}: {
  brand: string;
  label?: string;
  className?: string;
}) => {
  const id = CARD_BRAND_ALIASES[brand.toLowerCase().replace(/[^a-z0-9]/g, "")];
  return (
    <CardCanvas className={className} label={label}>
      {(id && CARD_NETWORK_MARKS[id]) || GENERIC_CARD_MARK}
    </CardCanvas>
  );
};
