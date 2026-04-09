export interface MarketplaceEntityData {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  rating: string;
  downloads: string;
  price: string;
  icon: string;
}

export class MarketplaceEntity {
  constructor(private readonly data: MarketplaceEntityData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get description() { return this.data.description; }
  get category() { return this.data.category; }
  get author() { return this.data.author; }
  get rating() { return this.data.rating; }
  get downloads() { return this.data.downloads; }
  get price() { return this.data.price; }
  get icon() { return this.data.icon; }

  copyWith(updates: Partial<MarketplaceEntityData>): MarketplaceEntity {
    return new MarketplaceEntity({ ...this.data, ...updates });
  }
}
