// Status codes: 1=Draft, 2=PendingReview, 3=Approved, 4=Published, 5=Deprecated, 6=Rejected

export interface PluginDefinitionModel {
  id: string;
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  /** 1 = Tier 1 (in-process / certified), 2 = Tier 2 (sandboxed) */
  tier: 1 | 2;
  /** 1=Draft, 2=PendingReview, 3=Approved, 4=Published, 5=Deprecated, 6=Rejected */
  status: 1 | 2 | 3 | 4 | 5 | 6;
  /** Scope bitmask: 1=Global, 2=Tenant, 4=User */
  scope: number;
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
  get id() { return this.data.id; }
  get key() { return this.data.key; }
  get name() { return this.data.name; }
  get nameAr() { return this.data.nameAr; }
  get description() { return this.data.description; }
  get descriptionAr() { return this.data.descriptionAr; }
  get tier() { return this.data.tier; }
  get status() { return this.data.status; }
  get scope() { return this.data.scope; }
  get iconUrl() { return this.data.iconUrl ?? null; }
  get colorHue() { return this.data.colorHue ?? null; }
  get colorChroma() { return this.data.colorChroma ?? null; }
  get workspaceKey() { return this.data.workspaceKey ?? null; }
  get manifestJson() { return this.data.manifestJson; }
  get baseUrl() { return this.data.baseUrl ?? null; }
  get frontendUrl() { return this.data.frontendUrl ?? null; }

  // ── Tier helpers ───────────────────────────────────────────────────────────
  get isTier1() { return this.data.tier === 1; }
  get isTier2() { return this.data.tier === 2; }

  // ── Status helpers ─────────────────────────────────────────────────────────
  get isDraft() { return this.data.status === 1; }
  get isPendingReview() { return this.data.status === 2; }
  get isApproved() { return this.data.status === 3; }
  get isPublished() { return this.data.status === 4; }
  get isDeprecated() { return this.data.status === 5; }
  get isRejected() { return this.data.status === 6; }

  // ── Date helpers ───────────────────────────────────────────────────────────
  get createdAt() { return new Date(this.data.createdAt); }
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

  toModel() { return this.data; }
}
