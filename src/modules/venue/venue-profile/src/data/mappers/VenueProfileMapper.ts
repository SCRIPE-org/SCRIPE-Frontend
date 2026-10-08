import { VenueProfile, type VenueProfileData } from "../../domain/entities/VenueProfile";
import { VenueProfileModel, type VenueProfileJson } from "../models/VenueProfileModel";

/**
 * Documentation for module export
 */
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
      siteName: model.siteName,
    };
    return new VenueProfile(data);
  }

  static fromJsonToEntity(json: VenueProfileJson): VenueProfile {
    return VenueProfileMapper.toEntity(VenueProfileModel.fromJson(json));
  }
}
