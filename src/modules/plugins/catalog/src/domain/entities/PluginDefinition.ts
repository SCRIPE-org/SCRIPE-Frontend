// Backend enum values (serialized as JSON strings via JsonStringEnumConverter):
//   PluginTier:   "Tier1" | "Tier2"
//   PluginStatus: "Draft" | "InReview" | "Approved" | "Published" | "Suspended" | "Deprecated"
//   PluginScope:  "Tenant" | "Global"

/** String union matching backend PluginTier enum. */
export type PluginTierValue = "Tier1" | "Tier2";

/** String union matching backend PluginStatus enum. */
export type PluginStatusValue =
  | "Draft"
  | "InReview"
  | "Approved"
  | "Published"
  | "Suspended"
  | "Deprecated";

/** String union matching backend PluginScope enum. */
export type PluginScopeValue = "Tenant" | "Global";

export interface PluginDefinitionModel {
  id: string;
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  /** Backend PluginTier: "Tier1" (in-process / certified), "Tier2" (sandboxed) */
  tier: PluginTierValue;
  /** Backend PluginStatus lifecycle */
  status: PluginStatusValue;
  /** Backend PluginScope */
  scope: PluginScopeValue;
  iconUrl?: string;
  colorHue?: number;
  colorChroma?: number;
  workspaceKey?: string;
  manifestJson: string;
  baseUrl?: string;
  frontendUrl?: string;
  createdAt: string;
}

export class PluginDefinition {
  constructor(private readonly data: PluginDefinitionModel) {}

  // ── Raw fields ─────────────────────────────────────────────────────────────
  get id() {
    return this.data.id;
  }
  get key() {
    return this.data.key;
  }
  get name() {
    return this.data.name;
  }
  get nameAr() {
    return this.data.nameAr;
  }
  get description() {
    return this.data.description;
  }
  get descriptionAr() {
    return this.data.descriptionAr;
  }
  get tier() {
    return this.data.tier;
  }
  get status() {
    return this.data.status;
  }
  get scope() {
    return this.data.scope;
  }
  get iconUrl() {
    return this.data.iconUrl ?? null;
  }
  get colorHue() {
    return this.data.colorHue ?? null;
  }
  get colorChroma() {
    return this.data.colorChroma ?? null;
  }
  get workspaceKey() {
    return this.data.workspaceKey ?? null;
  }
  get manifestJson() {
    return this.data.manifestJson;
  }
  get baseUrl() {
    return this.data.baseUrl ?? null;
  }
  get frontendUrl() {
    return this.data.frontendUrl ?? null;
  }

  // ── Tier helpers ───────────────────────────────────────────────────────────
  get isTier1() {
    return this.data.tier === "Tier1";
  }
  get isTier2() {
    return this.data.tier === "Tier2";
  }

  // ── Status helpers ─────────────────────────────────────────────────────────
  get isDraft() {
    return this.data.status === "Draft";
  }
  get isInReview() {
    return this.data.status === "InReview";
  }
  get isApproved() {
    return this.data.status === "Approved";
  }
  get isPublished() {
    return this.data.status === "Published";
  }
  get isSuspended() {
    return this.data.status === "Suspended";
  }
  get isDeprecated() {
    return this.data.status === "Deprecated";
  }

  /** True when the plugin can be installed by tenants (Published and not suspended). */
  get isAvailable() {
    return this.isPublished;
  }

  // ── Scope helpers ──────────────────────────────────────────────────────────
  get isTenantScoped() {
    return this.data.scope === "Tenant";
  }
  get isGlobalScoped() {
    return this.data.scope === "Global";
  }

  // ── Date helpers ───────────────────────────────────────────────────────────
  get createdAt() {
    return new Date(this.data.createdAt);
  }
  get createdAtDisplay() {
    return this.createdAt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // ── Copy ───────────────────────────────────────────────────────────────────
  copyWith(updates: Partial<PluginDefinitionModel>): PluginDefinition {
    return new PluginDefinition({ ...this.data, ...updates });
  }

  toModel() {
    return this.data;
  }
}
