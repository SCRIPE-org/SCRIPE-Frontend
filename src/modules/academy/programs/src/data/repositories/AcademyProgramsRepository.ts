import type { IAcademyProgramsRepository } from "../../domain/interfaces/IAcademyProgramsRepository";
import type { IAcademyProgramsService } from "../../domain/interfaces/IAcademyProgramsService";
import type { AcademyProgram, CreateProgramPayload, SportTaxonomyItem } from "../../domain/entities/AcademyProgram";

export class AcademyProgramsRepository implements IAcademyProgramsRepository {
  constructor(private readonly service: IAcademyProgramsService) {}

  async fetchPrograms(sportId?: string, isPublishedOnly?: boolean): Promise<AcademyProgram[]> {
    return await this.service.getPrograms(sportId, isPublishedOnly);
  }

  async fetchProgramById(id: string): Promise<AcademyProgram> {
    return await this.service.getProgramById(id);
  }

  async createProgram(payload: CreateProgramPayload): Promise<AcademyProgram> {
    return await this.service.createProgram(payload);
  }

  async publishProgram(id: string): Promise<AcademyProgram> {
    return await this.service.publishProgram(id);
  }

  async fetchSports(): Promise<SportTaxonomyItem[]> {
    return await this.service.getSports();
  }
}
