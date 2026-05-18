import { PluginDefinition } from "@modules/plugins/catalog";
import type { PluginDefinitionModel } from "@modules/plugins/catalog";

export class DefinitionsMapper {
  static toEntity(model: PluginDefinitionModel): PluginDefinition {
    return new PluginDefinition({
      id: model.id ?? "",
      key: model.key ?? "",
      name: model.name ?? "",
      nameAr: model.nameAr ?? "",
      description: model.description ?? "",
      descriptionAr: model.descriptionAr ?? "",
      tier: model.tier ?? 2,
      status: model.status ?? 1,
      scope: model.scope ?? 0,
      iconUrl: model.iconUrl,
      colorHue: model.colorHue,
      colorChroma: model.colorChroma,
      workspaceKey: model.workspaceKey,
      manifestJson: model.manifestJson ?? "{}",
      baseUrl: model.baseUrl,
      frontendUrl: model.frontendUrl,
      createdAt: model.createdAt ?? new Date().toISOString(),
    });
  }

  static toEntityList(models: PluginDefinitionModel[]): PluginDefinition[] {
    return models.map(DefinitionsMapper.toEntity);
  }
}
