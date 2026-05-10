import { PluginInstallation } from "../../domain/entities/PluginInstallation";
import type { PluginInstallationModel } from "../models/InstalledModels";

export class InstalledMapper {
  static toEntity(model: PluginInstallationModel): PluginInstallation {
    return new PluginInstallation(model);
  }
}
