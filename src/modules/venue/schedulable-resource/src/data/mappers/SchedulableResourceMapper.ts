import {
  SchedulableResource,
  type SchedulableResourceData,
} from "../../domain/entities/SchedulableResource";
import { SchedulableResourceModel } from "../models/SchedulableResourceModel";

export class SchedulableResourceMapper {
  static toEntity(model: SchedulableResourceModel): SchedulableResource {
    const data: SchedulableResourceData = {
      id: model.id,
      facilityResourceProfileId: model.facilityResourceProfileId,
      name: model.name,
      description: model.description,
      parentSchedulableResourceId: model.parentSchedulableResourceId,
      isComposite: model.isComposite,
      namedUnitLabel: model.namedUnitLabel,
      unitCount: model.unitCount,
      capacity: model.capacity,
      publicationStatus: model.publicationStatus,
      publishedAtUtc: model.publishedAtUtc,
      archivedAtUtc: model.archivedAtUtc,
      commercialReadinessNote: model.commercialReadinessNote,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new SchedulableResource(data);
  }
}
