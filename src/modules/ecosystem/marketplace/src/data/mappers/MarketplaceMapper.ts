import { MarketplaceEntity } from "../../domain/entities/MarketplaceEntity";
import type { MarketplaceModel } from "../models/MarketplaceModel";

export class MarketplaceMapper {
  static toEntity(dto: MarketplaceModel): MarketplaceEntity {
    return new MarketplaceEntity({
      id: dto.id ?? "",
      name: dto.name ?? "",
      description: dto.description ?? "",
      category: dto.category ?? "",
      author: dto.author ?? "",
      rating: dto.rating ?? "",
      downloads: dto.downloads ?? "",
      price: dto.price ?? "",
      icon: dto.icon ?? "",
    });
  }
}
