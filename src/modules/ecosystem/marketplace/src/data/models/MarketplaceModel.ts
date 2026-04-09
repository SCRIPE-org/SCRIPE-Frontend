export interface MarketplaceModel {
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

export interface MarketplaceListModel {
  id: string;
  name: string;
  category: string;
  author: string;
  rating: string;
  downloads: string;
}
