export interface SiteDto {
  id: string;
  name: string;
  branchId?: string | null;
  address?: string | null;
  timeZone?: string | null;
  createdAt?: string | null;
}

export interface SiteListResponseDto {
  items: SiteDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
