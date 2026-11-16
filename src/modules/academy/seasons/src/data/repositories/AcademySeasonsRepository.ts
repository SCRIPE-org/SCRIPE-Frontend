import type { IAcademySeasonsRepository } from "../../domain/interfaces/IAcademySeasonsRepository";
import type { IAcademySeasonsService } from "../../domain/interfaces/IAcademySeasonsService";
import type { AcademySeason, CreateSeasonPayload, UpdateSeasonPayload } from "../../domain/entities/AcademySeason";

export class AcademySeasonsRepository implements IAcademySeasonsRepository {
  constructor(private readonly service: IAcademySeasonsService) {}

  async fetchSeasons(): Promise<AcademySeason[]> {
    return await this.service.getSeasons();
  }

  async createSeason(payload: CreateSeasonPayload): Promise<AcademySeason> {
    return await this.service.createSeason(payload);
  }

  async updateSeason(id: string, payload: UpdateSeasonPayload): Promise<AcademySeason> {
    return await this.service.updateSeason(id, payload);
  }
}
