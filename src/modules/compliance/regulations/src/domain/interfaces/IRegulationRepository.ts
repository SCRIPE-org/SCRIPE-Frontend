import type { Regulation } from "../entities/Regulation";

export interface IRegulationRepository {
  getAll(): Promise<Regulation[]>;
  getById(id: string): Promise<Regulation>;
}
