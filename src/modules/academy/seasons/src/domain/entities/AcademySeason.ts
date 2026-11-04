export type SeasonStatus = "Draft" | "Active" | "Closed";

export interface AcademySeason {
  id: string;
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
}

export interface CreateSeasonPayload {
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
}
