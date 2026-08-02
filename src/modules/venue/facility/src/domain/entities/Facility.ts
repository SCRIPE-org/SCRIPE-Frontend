export interface FacilityData {
  id: string;
  venueProfileId: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  modifiedAt?: string;
}

export class Facility {
  constructor(public readonly data: FacilityData) {}

  get id(): string {
    return this.data.id;
  }

  get venueProfileId(): string {
    return this.data.venueProfileId;
  }

  get code(): string {
    return this.data.code;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }
}
