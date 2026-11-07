import type { TrainingSessionData } from "../../domain/entities/TrainingSession";

export type TrainingSessionDto = TrainingSessionData;

export interface TrainingSessionPageDto {
  items: TrainingSessionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
