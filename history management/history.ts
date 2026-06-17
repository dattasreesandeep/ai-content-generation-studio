export type ContentType =
  | 'blog'
  | 'social'
  | 'email'
  | 'ad'
  | 'product'
  | 'video-script'
  | 'other';

export type GenerationStatus = 'success' | 'failed' | 'in-progress';

export interface HistoryEntry {
  id: string;
  title: string;
  prompt: string;
  output: string;
  contentType: ContentType;
  model?: string;
  tokensUsed?: number;
  createdAt: string; // ISO string
  status: GenerationStatus;
  tags?: string[];
  isFavorite?: boolean;
  wordCount?: number;
  charCount?: number;
}

export type SortField = 'createdAt' | 'title' | 'contentType' | 'wordCount';
export type SortDirection = 'asc' | 'desc';

export interface HistoryFilters {
  search: string;
  contentType: ContentType | 'all';
  status: GenerationStatus | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
  favoritesOnly: boolean;
}

export interface HistoryState {
  entries: HistoryEntry[];
  filters: HistoryFilters;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedIds: Set<string>;
  page: number;
  pageSize: number;
}
