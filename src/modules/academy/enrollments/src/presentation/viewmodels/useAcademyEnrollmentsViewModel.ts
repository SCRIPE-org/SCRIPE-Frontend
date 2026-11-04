import { useState, useCallback, useEffect } from "react";
import type { IAcademyEnrollmentsRepository } from "../../domain/interfaces/IAcademyEnrollmentsRepository";
import type {
  AcademyEnrollment,
  CreateEnrollmentPayload,
  FinanceHandoffPayload
} from "../../domain/entities/AcademyEnrollment";

export function useAcademyEnrollmentsViewModel(repository: IAcademyEnrollmentsRepository) {
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<AcademyEnrollment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [billingFilter, setBillingFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async (offeringId?: string, athleteId?: string, status?: string, billingStatus?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getEnrollments(offeringId, athleteId, status || undefined, billingStatus || undefined);
      setEnrollments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createEnrollment = useCallback(async (payload: CreateEnrollmentPayload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await repository.createEnrollment(payload);
      setEnrollments(prev => [created, ...prev]);
      setSuccessMessage("Enrollment created and capacity atomically reserved.");
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create enrollment";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const handoffToFinance = useCallback(async (enrollmentId: string, payload?: FinanceHandoffPayload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await repository.handoffToFinance(enrollmentId, payload);
      setEnrollments(prev => prev.map(e => (e.id === enrollmentId ? updated : e)));
      if (selectedEnrollment?.id === enrollmentId) setSelectedEnrollment(updated);
      setSuccessMessage(`Invoice issued: ${updated.financeInvoiceReference || "Pending"}.`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to hand off enrollment to finance";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository, selectedEnrollment]);

  const activateEnrollment = useCallback(async (enrollmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await repository.activateEnrollment(enrollmentId);
      setEnrollments(prev => prev.map(e => (e.id === enrollmentId ? updated : e)));
      if (selectedEnrollment?.id === enrollmentId) setSelectedEnrollment(updated);
      setSuccessMessage("Enrollment activated successfully.");
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to activate enrollment";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository, selectedEnrollment]);

  useEffect(() => {
    fetchEnrollments(undefined, undefined, statusFilter, billingFilter);
  }, [fetchEnrollments, statusFilter, billingFilter]);

  return {
    enrollments,
    selectedEnrollment,
    statusFilter,
    billingFilter,
    loading,
    error,
    successMessage,
    setSelectedEnrollment,
    setStatusFilter,
    setBillingFilter,
    fetchEnrollments,
    createEnrollment,
    handoffToFinance,
    activateEnrollment
  };
}
