export interface ExternalLocation {
  id: string;
  branchId?: string | null;
  nameEn: string;
  nameAr: string;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  availabilityDisclaimer: string;
  isActive: boolean;
}

export interface CreateLocationPayload {
  branchId?: string | null;
  nameEn: string;
  nameAr: string;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
}
