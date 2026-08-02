import { VenueProfile, type VenueProfileData } from "../../domain/entities/VenueProfile";
import { VenueProfileModel, type VenueProfileJson } from "../models/VenueProfileModel";

export class VenueProfileMapper {
  static toEntity(model: VenueProfileModel): VenueProfile {
    const data: VenueProfileData = {
      id: model.id,
      siteId: model.siteId,
      code: model.code,
      name: model.name,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new VenueProfile(data);
  }

  static fromJsonToEntity(json: VenueProfileJson): VenueProfile {
    return VenueProfileMapper.toEntity(VenueProfileModel.fromJson(json));
  }
}
