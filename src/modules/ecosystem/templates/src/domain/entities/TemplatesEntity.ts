export interface TemplatesEntityData {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: string;
  createdAt: string;
  updatedAt: string;
}

export class TemplatesEntity {
  constructor(private readonly data: TemplatesEntityData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get description() { return this.data.description; }
  get category() { return this.data.category; }
  get isActive() { return this.data.isActive; }
  get createdAt() { return this.data.createdAt; }
  get updatedAt() { return this.data.updatedAt; }

  copyWith(updates: Partial<TemplatesEntityData>): TemplatesEntity {
    return new TemplatesEntity({ ...this.data, ...updates });
  }
}
