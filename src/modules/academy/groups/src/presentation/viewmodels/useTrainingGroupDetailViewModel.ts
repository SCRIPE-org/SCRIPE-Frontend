"use client";

import { useState, useCallback } from "react";
import type { ITrainingGroupsRepository } from "../../domain/interfaces/ITrainingGroupsRepository";
import type {
  TrainingGroup,
  GroupRosterItem,
  GroupCoach,
  AssignAthletePayload,
  TransferAthletePayload,
  AssignCoachPayload
} from "../../domain/entities/TrainingGroup";

export function useTrainingGroupDetailViewModel(repository: ITrainingGroupsRepository) {
  const [group, setGroup] = useState<TrainingGroup | null>(null);
  const [roster, setRoster] = useState<GroupRosterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const loadGroupDetails = useCallback(
    async (groupId: string, activeOnly = true) => {
      setLoading(true);
      setError(null);
      try {
        const [groupData, rosterData] = await Promise.all([
          repository.getGroupById(groupId),
          repository.getRoster(groupId, activeOnly)
        ]);
        setGroup(groupData);
        setRoster(rosterData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load group details");
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  const assignAthlete = useCallback(
    async (groupId: string, payload: AssignAthletePayload) => {
      setLoading(true);
      setError(null);
      try {
        await repository.assignAthlete(groupId, payload);
        setSuccessMessage("Athlete assigned to training group successfully.");
        // Reload roster and group count
        await loadGroupDetails(groupId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to assign athlete";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository, loadGroupDetails]
  );

  const removeAthlete = useCallback(
    async (groupId: string, membershipId: string, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        await repository.removeAthlete(groupId, membershipId, reason);
        setSuccessMessage("Athlete removed from training group.");
        await loadGroupDetails(groupId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to remove athlete";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository, loadGroupDetails]
  );

  const transferAthlete = useCallback(
    async (groupId: string, membershipId: string, payload: TransferAthletePayload) => {
      setLoading(true);
      setError(null);
      try {
        await repository.transferAthlete(groupId, membershipId, payload);
        setSuccessMessage("Athlete transferred successfully.");
        await loadGroupDetails(groupId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to transfer athlete";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository, loadGroupDetails]
  );

  const assignCoach = useCallback(
    async (groupId: string, payload: AssignCoachPayload) => {
      setLoading(true);
      setError(null);
      try {
        await repository.assignCoach(groupId, payload);
        setSuccessMessage("Coach assigned to training group successfully.");
        await loadGroupDetails(groupId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to assign coach";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository, loadGroupDetails]
  );

  const removeCoach = useCallback(
    async (groupId: string, coachId: string) => {
      setLoading(true);
      setError(null);
      try {
        await repository.removeCoach(groupId, coachId);
        setSuccessMessage("Coach unassigned from training group.");
        await loadGroupDetails(groupId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to remove coach";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository, loadGroupDetails]
  );

  return {
    group,
    roster,
    coaches: group?.coaches ?? [],
    loading,
    error,
    successMessage,
    clearMessages,
    loadGroupDetails,
    assignAthlete,
    removeAthlete,
    transferAthlete,
    assignCoach,
    removeCoach
  };
}
