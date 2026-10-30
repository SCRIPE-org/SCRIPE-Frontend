import { useState, useCallback, useEffect } from "react";
import type { IAcademyAthletesRepository } from "../../domain/interfaces/IAcademyAthletesRepository";
import type {
  AcademyAthlete,
  GuardianSummary,
  RegisterChildAthletePayload,
  RegisterAdultAthletePayload,
  LinkSiblingAthletePayload,
  AddSportParticipationPayload,
  AthleteSportTaxonomyItem
} from "../../domain/entities/AcademyAthlete";

export function useAcademyAthletesViewModel(repository: IAcademyAthletesRepository) {
  const [athletes, setAthletes] = useState<AcademyAthlete[]>([]);
  const [sports, setSports] = useState<AthleteSportTaxonomyItem[]>([]);
  const [guardians, setGuardians] = useState<GuardianSummary[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<AcademyAthlete | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchSports = useCallback(async () => {
    try {
      const items = await repository.getSports();
      setSports(items);
    } catch {
      // Fallback sports
      setSports([
        { id: "sport-fb", code: "FB", nameEn: "Football", nameAr: "كرة القدم", isActive: true },
        { id: "sport-sw", code: "SW", nameEn: "Swimming", nameAr: "السباحة", isActive: true },
        { id: "sport-bk", code: "BK", nameEn: "Basketball", nameAr: "كرة السلة", isActive: true },
        { id: "sport-tn", code: "TN", nameEn: "Tennis", nameAr: "التنس", isActive: true }
      ]);
    }
  }, [repository]);

  const fetchAthletes = useCallback(async (branchId?: string, sportId?: string, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getAthletes(branchId, sportId || undefined, search || undefined);
      setAthletes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load athletes");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const searchGuardians = useCallback(async (query?: string) => {
    try {
      const data = await repository.searchGuardians(query);
      setGuardians(data);
    } catch {
      setGuardians([]);
    }
  }, [repository]);

  const selectAthlete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const athlete = await repository.getAthleteById(id);
      setSelectedAthlete(athlete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch athlete details");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const clearSelectedAthlete = useCallback(() => {
    setSelectedAthlete(null);
  }, []);

  const registerChild = useCallback(async (payload: RegisterChildAthletePayload) => {
    setLoading(true);
    setError(null);
    try {
      const newAthlete = await repository.registerChild(payload);
      setAthletes(prev => [newAthlete, ...prev]);
      setSuccessMessage("Child athlete registered successfully.");
      return newAthlete;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to register child athlete";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const registerAdult = useCallback(async (payload: RegisterAdultAthletePayload) => {
    setLoading(true);
    setError(null);
    try {
      const newAthlete = await repository.registerAdult(payload);
      setAthletes(prev => [newAthlete, ...prev]);
      setSuccessMessage("Adult athlete registered successfully.");
      return newAthlete;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to register adult athlete";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const linkSibling = useCallback(async (payload: LinkSiblingAthletePayload) => {
    setLoading(true);
    setError(null);
    try {
      const newAthlete = await repository.linkSibling(payload);
      setAthletes(prev => [newAthlete, ...prev]);
      setSuccessMessage("Sibling linked to family successfully.");
      return newAthlete;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to link sibling";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const addSportParticipation = useCallback(async (athleteId: string, payload: AddSportParticipationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const part = await repository.addSportParticipation(athleteId, payload);
      setAthletes(prev => prev.map(a => {
        if (a.id === athleteId) {
          return { ...a, participations: [...a.participations, part] };
        }
        return a;
      }));
      if (selectedAthlete && selectedAthlete.id === athleteId) {
        setSelectedAthlete(prev => prev ? { ...prev, participations: [...prev.participations, part] } : null);
      }
      setSuccessMessage("Sport participation added.");
      return part;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add sport participation";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository, selectedAthlete]);

  useEffect(() => {
    fetchSports();
    fetchAthletes(undefined, selectedSportId, searchQuery);
  }, [fetchSports, fetchAthletes, selectedSportId, searchQuery]);

  return {
    athletes,
    sports,
    guardians,
    selectedAthlete,
    loading,
    error,
    successMessage,
    selectedSportId,
    searchQuery,
    setSelectedSportId,
    setSearchQuery,
    fetchAthletes,
    searchGuardians,
    selectAthlete,
    clearSelectedAthlete,
    registerChild,
    registerAdult,
    linkSibling,
    addSportParticipation
  };
}
