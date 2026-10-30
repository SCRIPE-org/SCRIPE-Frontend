import { useState, useCallback, useEffect } from "react";
import type { IAcademyTrialsRepository } from "../../domain/interfaces/IAcademyTrialsRepository";
import type {
  AcademyTrial,
  RequestTrialPayload,
  SubmitEvaluationPayload,
  DecideTrialPayload,
  TrialStatus
} from "../../domain/entities/AcademyTrial";

export function useAcademyTrialsViewModel(repository: IAcademyTrialsRepository) {
  const [trials, setTrials] = useState<AcademyTrial[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<AcademyTrial | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTrials = useCallback(async (offeringId?: string, athleteId?: string, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getTrials(offeringId, athleteId, status || undefined);
      setTrials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trials");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const requestTrial = useCallback(async (payload: RequestTrialPayload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await repository.requestTrial(payload);
      setTrials(prev => [created, ...prev]);
      setSuccessMessage("Trial scheduled successfully.");
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to schedule trial";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const submitEvaluation = useCallback(async (trialId: string, payload: SubmitEvaluationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await repository.submitEvaluation(trialId, payload);
      setTrials(prev => prev.map(t => (t.id === trialId ? updated : t)));
      if (selectedTrial?.id === trialId) setSelectedTrial(updated);
      setSuccessMessage("Technical evaluation recorded successfully.");
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit technical evaluation";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository, selectedTrial]);

  const decideTrial = useCallback(async (trialId: string, payload: DecideTrialPayload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await repository.decideTrial(trialId, payload);
      setTrials(prev => prev.map(t => (t.id === trialId ? updated : t)));
      if (selectedTrial?.id === trialId) setSelectedTrial(updated);
      setSuccessMessage(`Trial marked as ${updated.status}.`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to record administrative decision";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository, selectedTrial]);

  useEffect(() => {
    fetchTrials(undefined, undefined, statusFilter);
  }, [fetchTrials, statusFilter]);

  return {
    trials,
    selectedTrial,
    statusFilter,
    loading,
    error,
    successMessage,
    setSelectedTrial,
    setStatusFilter,
    fetchTrials,
    requestTrial,
    submitEvaluation,
    decideTrial
  };
}
