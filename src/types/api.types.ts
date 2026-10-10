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
  total: number;
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
