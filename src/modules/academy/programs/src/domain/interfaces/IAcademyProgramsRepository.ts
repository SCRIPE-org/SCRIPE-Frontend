import type { AcademyProgram, CreateProgramPayload, SportTaxonomyItem } from "../entities/AcademyProgram";

export interface IAcademyProgramsRepository {
  fetchPrograms(sportId?: string, isPublishedOnly?: boolean): Promise<AcademyProgram[]>;
  fetchProgramById(id: string): Promise<AcademyProgram>;
  createProgram(payload: CreateProgramPayload): Promise<AcademyProgram>;
  publishProgram(id: string): Promise<AcademyProgram>;
  fetchSports(): Promise<SportTaxonomyItem[]>;
}
