/**
 * BrandIcons — Central registry for all social and enterprise SSO identity provider logos.
 * Restructures SVGs as standard React components to avoid raw HTML string injection.
 */

interface IconProps {
  slug: string;
  name?: string;
  protocol?: string;
  className?: string;
}

/** Fallback protocol-specific SVGs */
export const ProtocolIcon = ({
  protocol,
  className = "h-4 w-4 shrink-0",
}: {
  protocol: string;
  className?: string;
}) => {
  const lowerProtocol = protocol.toLowerCase();

  if (lowerProtocol === "saml") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    );
  }
  if (lowerProtocol === "oauth2") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    );
  }
  // oidc default
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
};

/** Brand logo SVG renderer matching all fixed identities */
export const BrandIcon = ({
  slug,
  name = "",
  protocol = "",
  className = "h-[18px] w-[18px] shrink-0",
}: IconProps) => {
  const lowerName = name.toLowerCase();
  const lowerSlug = slug.toLowerCase();

  // 1. Google
  if (lowerName.includes("google") || lowerSlug.includes("google")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
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
      </svg>
    );
  }

  // 2. Microsoft / Azure / Entra
  if (
    lowerName.includes("microsoft") ||
    lowerName.includes("entra") ||
    lowerName.includes("azure") ||
    lowerSlug.includes("microsoft") ||
    lowerSlug.includes("entra") ||
    lowerSlug.includes("azure")
  ) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    );
  }

  // 3. Apple
  if (lowerName.includes("apple") || lowerSlug.includes("apple")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.23-.58 2.94-1.39z" />
      </svg>
    );
  }

  // 4. GitHub
  if (lowerName.includes("github") || lowerSlug.includes("github")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }

  // 5. Facebook
  if (lowerName.includes("facebook") || lowerSlug.includes("facebook")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  // 6. Okta
  if (lowerName.includes("okta") || lowerSlug.includes("okta")) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#007DC1"
          d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 17.882a5.882 5.882 0 110-11.764 5.882 5.882 0 010 11.764z"
        />
      </svg>
    );
  }

  // 7. Auth0
  if (lowerName.includes("auth0") || lowerSlug.includes("auth0")) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#EB5424"
          d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.8 15.75l-4.8 1.567-4.8-1.567 1.567-4.822L12 6.683l3.233 4.245L16.8 15.75z"
        />
      </svg>
    );
  }

  // 8. Azure AD B2C
  if (
    lowerName.includes("azure-ad-b2c") ||
    lowerName.includes("ad-b2c") ||
    lowerName.includes("adb2c") ||
    lowerSlug.includes("b2c")
  ) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#0078D4"
          d="M12 2L2 7l2 12 8 3 8-3 2-12-10-5zm0 3.236L19.3 8.4l-1.6 9.6-5.7 2.138-5.7-2.138-1.6-9.6L12 5.236z"
        />
      </svg>
    );
  }

  // 9. Keycloak
  if (lowerName.includes("keycloak") || lowerSlug.includes("keycloak")) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#4D4D4D"
          d="M11.987 0L0 6.955 3.76 9.1l8.227-4.698 8.228 4.698L24 6.955 11.987 0zM3.76 14.9l-3.76 2.145L11.987 24 24 17.045l-3.785-2.145-8.228 4.698L3.76 14.9zM0 9.6v4.8l3.76 2.145V11.77L0 9.6zm24 0l-3.785 2.17v4.775L24 14.4V9.6z"
        />
      </svg>
    );
  }

  // 10. Ping Identity
  if (lowerName.includes("ping") || lowerSlug.includes("ping")) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#E91E63" strokeWidth="2" />
        <circle cx="12" cy="12" r="5" fill="#E91E63" />
      </svg>
    );
  }

  // 11. AWS Cognito
  if (
    lowerName.includes("cognito") ||
    lowerName.includes("aws") ||
    lowerSlug.includes("cognito") ||
    lowerSlug.includes("aws")
  ) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#FF9900" />
        <path
          d="M2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="#FF9900"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 12. OneLogin
  if (lowerName.includes("onelogin") || lowerSlug.includes("onelogin")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="#E41F35" />
        <path d="M8 7v10h3v-7h2v7h3V7H8z" fill="white" />
      </svg>
    );
  }

  // 13. JumpCloud
  if (lowerName.includes("jumpcloud") || lowerSlug.includes("jumpcloud")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#00A3E0" strokeWidth="2.5" />
        <path
          d="M7 11l5-5 5 5m-10 2l5 5 5-5"
          stroke="#00A3E0"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 14. Duo Security
  if (lowerName.includes("duo") || lowerSlug.includes("duo")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#4AA23A" />
        <path d="M8 8h4a4 4 0 010 8H8V8zm3 3v2h1a1 1 0 000-2h-1z" fill="white" />
      </svg>
    );
  }

  // 15. Cloudflare Access
  if (lowerName.includes("cloudflare") || lowerSlug.includes("cloudflare")) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20.25 15.75a4.5 4.5 0 00-4.04-2.825A5.25 5.25 0 006 12.75a3 3 0 00-3 3 3 3 0 003 3h14.25a3 3 0 000-6z"
          fill="#F38020"
        />
      </svg>
    );
  }

  // 16. Salesforce
  if (lowerName.includes("salesforce") || lowerSlug.includes("salesforce")) {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#009DDC"
          d="M19.12 11.23a4 4 0 00-3.8-3.08 4 4 0 00-3.6 2.1 5.3 5.3 0 00-8.2 2.65 3.3 3.3 0 00.48 6.5h15.12a3.3 3.3 0 000-6.6l-.12-.57z"
        />
      </svg>
    );
  }

  // Fallbacks based on protocol
  if (protocol) {
    return <ProtocolIcon protocol={protocol} className={className} />;
  }

  return <ProtocolIcon protocol="oidc" className={className} />;
};
