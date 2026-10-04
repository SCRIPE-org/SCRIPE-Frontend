/**
 * TenantDomain & TenantDomainsConfig Entities
 *
 * Rich domain entities representing tenant domain configurations in the
 * multi-tenancy subsystem. Encapsulates business logic, apex/subdomain detection,
 * DNS record specifications, and validation rules.
 *
 * Clean Architecture Layer: Domain Entity (Zero external dependencies).
 *
 * @module tenants/domain/entities
 */

/**
 * Property values defining an individual tenant domain record.
 */
export interface TenantDomainProps {
  /** Unique encrypted identifier for the domain mapping */
  readonly id: string;
  /** Hostname string (e.g. "acme.com" or "www.acme.com") */
  readonly domain: string;
  /** Assignment mode: "auto" (platform managed) or "custom" (vanity) */
  readonly type: "auto" | "custom";
  /** Whether this domain is currently designated as the primary tenant host */
  readonly isPrimary: boolean;
  /** Whether DNS ownership and validation challenges have succeeded */
  readonly isVerified: boolean;
  /** DNS verification challenge token (e.g. "scr_abc123") */
  readonly verificationToken: string | null;
  /** ISO timestamp when ownership verification was completed */
  readonly verifiedAt: string | null;
  /** ISO creation timestamp */
  readonly createdAt: string;
  /** Target hostname to redirect to (e.g. "seif.com" or "www.seif.com") */
  readonly redirectTo?: string | null;
  /** HTTP redirect status code (301, 302, 307, 308) */
  readonly redirectStatusCode?: number | null;
}

/**
 * Rich Domain Entity representing a Tenant Domain.
 * Provides computed routing targets and DNS configuration descriptors.
 */
export class TenantDomain {
  constructor(public readonly props: TenantDomainProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get domain(): string {
    return this.props.domain;
  }

  public get type(): "auto" | "custom" {
    return this.props.type;
  }

  public get isPrimary(): boolean {
    return this.props.isPrimary;
  }

  public get isVerified(): boolean {
    return this.props.isVerified;
  }

  public get verificationToken(): string | null {
    return this.props.verificationToken;
  }

  public get verifiedAt(): string | null {
    return this.props.verifiedAt;
  }

  public get createdAt(): string {
    return this.props.createdAt;
  }

  public get redirectTo(): string | null {
    return this.props.redirectTo ?? null;
  }

  public get redirectStatusCode(): number | null {
    return this.props.redirectStatusCode ?? null;
  }

  /** Whether this domain is configured to redirect to another domain */
  public get isRedirect(): boolean {
    return Boolean(this.props.redirectTo);
  }

  /** Formatted redirect badge label (e.g. "[308] www.seif.com") */
  public get redirectDisplay(): string | null {
    if (!this.isRedirect || !this.redirectTo) return null;
    return `[${this.redirectStatusCode || 308}] ${this.redirectTo}`;
  }

  /** True if this is an auto-generated platform domain */
  public get isAuto(): boolean {
    return this.props.type === "auto";
  }

  /** True if this is a custom vanity domain */
  public get isCustom(): boolean {
    return this.props.type === "custom";
  }

  /**
   * Evaluates hostname labels to determine apex (root) status and subdomain prefix.
   */
  public get parsedHostname(): {
    clean: string;
    isApex: boolean;
    subdomain: string;
    apexDomain: string;
  } {
    const clean = this.props.domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/\.+$/, "");

    if (!clean) {
      return { clean: "", isApex: false, subdomain: "@", apexDomain: "" };
    }

    const parts = clean.split(".").filter(Boolean);
    const isApex = parts.length <= 2;
    const subdomain = !isApex ? parts.slice(0, -2).join(".") : "@";
    const apexDomain = isApex ? clean : parts.slice(-2).join(".");

    return { clean, isApex, subdomain, apexDomain };
  }

  /** True if the domain is a naked root apex domain (e.g. "acme.com") */
  public get isApex(): boolean {
    return this.parsedHostname.isApex;
  }

  /** Extracted subdomain part (e.g. "www" for "www.acme.com", "@" for apex) */
  public get subdomain(): string {
    return this.parsedHostname.subdomain;
  }

  /** Root apex parent (e.g. "acme.com") */
  public get apexDomain(): string {
    return this.parsedHostname.apexDomain;
  }

  /** Recommended routing DNS record type (A/ALIAS for apex, CNAME for subdomains) */
  public get routingRecordType(): string {
    return this.isApex ? "A / ALIAS" : "CNAME";
  }

  /** Recommended routing record host/name */
  public get routingRecordName(): string {
    return this.isApex ? "@" : this.subdomain;
  }

  /** Recommended verification TXT record host/name */
  public getVerificationRecordName(prefix: string): string {
    const cleanPrefix = prefix || "_scr-verify";
    return this.isApex ? cleanPrefix : `${cleanPrefix}.${this.subdomain}`;
  }

  /**
   * Creates an immutable clone with updated property values.
   */
  public copyWith(updates: Partial<TenantDomainProps>): TenantDomain {
    return new TenantDomain({
      ...this.props,
      ...updates,
    });
  }
}

/**
 * Property values defining a complete tenant domains configuration query result.
 */
export interface TenantDomainsConfigProps {
  readonly domains: TenantDomain[];
  readonly cnameTarget: string;
  readonly verificationPrefix: string;
}

/**
 * Domain Aggregate representing the full domain configuration and platform targets.
 */
export class TenantDomainsConfig {
  constructor(public readonly props: TenantDomainsConfigProps) {}

  public get domains(): TenantDomain[] {
    return this.props.domains;
  }

  public get cnameTarget(): string {
    return this.props.cnameTarget;
  }

  public get verificationPrefix(): string {
    return this.props.verificationPrefix;
  }

  public get autoDomains(): TenantDomain[] {
    return this.props.domains.filter((d) => d.isAuto);
  }

  public get customDomains(): TenantDomain[] {
    return this.props.domains.filter((d) => d.isCustom);
  }

  public get primaryDomain(): TenantDomain | null {
    return this.props.domains.find((d) => d.isPrimary) ?? null;
  }

  public get verifiedCount(): number {
    return this.customDomains.filter((d) => d.isVerified).length;
  }

  public get pendingCount(): number {
    return this.customDomains.filter((d) => !d.isVerified).length;
  }

  public get totalCount(): number {
    return this.props.domains.length;
  }
}
