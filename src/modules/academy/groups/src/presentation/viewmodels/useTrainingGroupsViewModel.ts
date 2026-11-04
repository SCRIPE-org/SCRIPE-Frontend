"use client";

import { useState, useCallback } from "react";
import type { ITrainingGroupsRepository } from "../../domain/interfaces/ITrainingGroupsRepository";
import type {
  TrainingGroup,
  CreateTrainingGroupPayload,
  UpdateTrainingGroupPayload
} from "../../domain/entities/TrainingGroup";

export function useTrainingGroupsViewModel(repository: ITrainingGroupsRepository) {
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TrainingGroup | null>(null);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const fetchGroups = useCallback(
    async (offeringId?: string, branchId?: string, status?: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await repository.getGroups(offeringId || undefined, branchId, status || undefined);
        setGroups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load training groups");
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  const createGroup = useCallback(
    async (payload: CreateTrainingGroupPayload) => {
      setLoading(true);
      setError(null);
      try {
        const created = await repository.createGroup(payload);
        setGroups(prev => [created, ...prev]);
        setSuccessMessage("Training group created successfully.");
        return created;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create training group";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  const updateGroup = useCallback(
    async (id: string, payload: UpdateTrainingGroupPayload) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await repository.updateGroup(id, payload);
        setGroups(prev => prev.map(g => (g.id === id ? updated : g)));
        if (selectedGroup?.id === id) setSelectedGroup(updated);
        setSuccessMessage("Training group updated successfully.");
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update training group";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository, selectedGroup]
  );

  const archiveGroup = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await repository.archiveGroup(id);
        setGroups(prev => prev.map(g => (g.id === id ? { ...g, status: "Archived" } : g)));
        setSuccessMessage("Training group archived successfully.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to archive training group";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return {
    groups,
    selectedGroup,
    setSelectedGroup,
    selectedOfferingId,
    setSelectedOfferingId,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    successMessage,
    clearMessages,
    fetchGroups,
    createGroup,
    updateGroup,
    archiveGroup
  };
}
