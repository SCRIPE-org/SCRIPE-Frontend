import type { RegulationProfileModel } from "../models/RegulationModels";
import { Regulation } from "../../domain/entities/Regulation";

export class RegulationMapper {
  static toEntity(model: RegulationProfileModel): Regulation {
    return new Regulation(model);
  }
}
