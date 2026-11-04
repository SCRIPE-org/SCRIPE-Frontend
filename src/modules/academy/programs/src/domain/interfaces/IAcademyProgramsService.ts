import type { AcademyProgram, CreateProgramPayload, SportTaxonomyItem } from "../entities/AcademyProgram";

export interface IAcademyProgramsService {
  getPrograms(sportId?: string, isPublishedOnly?: boolean): Promise<AcademyProgram[]>;
  getProgramById(id: string): Promise<AcademyProgram>;
  createProgram(payload: CreateProgramPayload): Promise<AcademyProgram>;
  publishProgram(id: string): Promise<AcademyProgram>;
  getSports(): Promise<SportTaxonomyItem[]>;
}
