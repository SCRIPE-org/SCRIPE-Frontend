import { Facility, type FacilityData } from "../../domain/entities/Facility";
import { FacilityModel, type FacilityJson } from "../models/FacilityModel";

/**
 * Documentation for module export
 */
export class FacilityMapper {
  static toEntity(model: FacilityModel): Facility {
    const data: FacilityData = {
      id: model.id,
      venueProfileId: model.venueProfileId,
      code: model.code,
      name: model.name,
      description: model.description,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
      venueProfileName: model.venueProfileName,
    };
    return new Facility(data);
  }

  static fromJsonToEntity(json: FacilityJson): Facility {
    return FacilityMapper.toEntity(FacilityModel.fromJson(json));
  }
}
