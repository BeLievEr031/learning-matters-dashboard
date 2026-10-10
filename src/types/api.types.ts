export interface ApiErrorDetail {
  path?: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export interface PaginationMeta {
  total?: number;
  page?: number;
  limit: number;
  totalPages?: number;
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface PageInfo {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  data: T[];
  meta?: PaginationMeta;
  pageInfo?: PageInfo;
}
