import { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";
import type { PluginCatalogItemModel } from "../models/CatalogModels";

export class CatalogMapper {
  static toEntity(model: PluginCatalogItemModel): PluginCatalogItem {
    return new PluginCatalogItem(model);
  }
}
