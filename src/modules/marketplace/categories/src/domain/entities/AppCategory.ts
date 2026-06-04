export interface AppCategoryData {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  iconUrl: string | null;
  description: string;
  descriptionAr: string;
  appCount: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export class AppCategory {
  constructor(private readonly data: AppCategoryData) {}
  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name;
  }
  get nameAr() {
    return this.data.nameAr;
  }
  get slug() {
    return this.data.slug;
  }
  get iconUrl() {
    return this.data.iconUrl;
  }
  get description() {
    return this.data.description;
  }
  get descriptionAr() {
    return this.data.descriptionAr;
  }
  get appCount() {
    return this.data.appCount;
  }
  get sortOrder() {
    return this.data.sortOrder;
  }
  get isActive() {
    return this.data.isActive;
  }
  get createdAt() {
    return this.data.createdAt;
  }

  copyWith(updates: Partial<AppCategoryData>): AppCategory {
    return new AppCategory({ ...this.data, ...updates });
  }
}
