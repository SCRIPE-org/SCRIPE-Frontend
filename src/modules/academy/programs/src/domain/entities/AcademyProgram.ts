export type ProgramLevel = "Beginner" | "Intermediate" | "Advanced" | "Elite";
export type GenderCriteria = "Mixed" | "BoysOnly" | "GirlsOnly";
export type ProgramStatus = "Draft" | "Published" | "Archived";

export interface AcademyProgram {
  id: string;
  sportId: string;
  disciplineId?: string | null;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  minAge: number;
  maxAge: number;
  level: ProgramLevel;
  genderCriteria: GenderCriteria;
  status: ProgramStatus;
  version: number;
}

export interface CreateProgramPayload {
  sportId: string;
  disciplineId?: string | null;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  minAge: number;
  maxAge: number;
  level: ProgramLevel;
  genderCriteria: GenderCriteria;
}

export interface SportTaxonomyItem {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isActive: boolean;
}
