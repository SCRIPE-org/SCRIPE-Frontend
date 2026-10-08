/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaginationInfo } from "@core/common/pagination";

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface CrudState<T> {
  items: T[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  selectedItems: string[];
}

export interface BaseEntity {
  id: string;
  [key: string]: any;
}
