import type { PluginCatalogItemModel } from "../../data/models/CatalogModels";

/**
 * Domain entity class representing a Plugin Catalog Item.
 */
export class PluginCatalogItem {
  constructor(private readonly data: PluginCatalogItemModel) {}

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
  get iconUrl() {
    return this.data.iconUrl ?? null;
  }
  get colorHue() {
    return this.data.colorHue ?? null;
  }
  get colorChroma() {
    return this.data.colorChroma ?? null;
  }
  get isInstalled() {
    return this.data.isInstalled;
  }
  get isTier1() {
    return this.data.tier === "Tier1";
  }
  get isTier2() {
    return this.data.tier === "Tier2";
  }

  toModel() {
    return this.data;
  }

  copyWith(updates: Partial<PluginCatalogItemModel>): PluginCatalogItem {
    return new PluginCatalogItem({
      ...this.data,
      ...updates,
    } as PluginCatalogItemModel);
  }
}
