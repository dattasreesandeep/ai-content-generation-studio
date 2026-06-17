import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HistoryEntry,
  HistoryFilters,
  HistoryState,
  SortField,
  SortDirection,
  ContentType,
  GenerationStatus,
} from '../types/history';
import {
  loadHistory,
  deleteHistoryEntries,
  toggleFavorite as storageFavorite,
  updateHistoryEntry,
  clearAllHistory,
  seedDemoHistory,
} from '../utils/historyStorage';

const DEFAULT_FILTERS: HistoryFilters = {
  search: '',
  contentType: 'all',
  status: 'all',
  dateRange: 'all',
  favoritesOnly: false,
};

const PAGE_SIZE = 10;

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Load on mount
  useEffect(() => {
    seedDemoHistory();
    setEntries(loadHistory());
  }, []);

  // Reload from storage (for cross-tab sync)
  const refresh = useCallback(() => {
    setEntries(loadHistory());
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    const now = Date.now();
    const DAY = 86_400_000;

    return entries.filter((e) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !e.title.toLowerCase().includes(q) &&
          !e.prompt.toLowerCase().includes(q) &&
          !e.output.toLowerCase().includes(q) &&
          !(e.tags ?? []).some((t) => t.toLowerCase().includes(q))
        ) {
          return false;
        }
      }

      // Content type
      if (filters.contentType !== 'all' && e.contentType !== filters.contentType)
        return false;

      // Status
      if (filters.status !== 'all' && e.status !== filters.status) return false;

      // Date range
      const created = new Date(e.createdAt).getTime();
      if (filters.dateRange === 'today' && now - created > DAY) return false;
      if (filters.dateRange === 'week' && now - created > 7 * DAY) return false;
      if (filters.dateRange === 'month' && now - created > 30 * DAY) return false;

      // Favorites
      if (filters.favoritesOnly && !e.isFavorite) return false;

      return true;
    });
  }, [entries, filters]);

  // ── Sorting ────────────────────────────────────────────────────────────────
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'contentType':
          aVal = a.contentType;
          bVal = b.contentType;
          break;
        case 'wordCount':
          aVal = a.wordCount ?? 0;
          bVal = b.wordCount ?? 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEntries, sortField, sortDirection]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / PAGE_SIZE));
  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedEntries.slice(start, start + PAGE_SIZE);
  }, [sortedEntries, page]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const setFilter = useCallback(
    <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    },
    [sortField]
  );

  const deleteSelected = useCallback(() => {
    const updated = deleteHistoryEntries([...selectedIds]);
    setEntries(updated);
    setSelectedIds(new Set());
  }, [selectedIds]);

  const deleteOne = useCallback((id: string) => {
    const updated = deleteHistoryEntries([id]);
    setEntries(updated);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const updated = storageFavorite(id);
    setEntries(updated);
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<HistoryEntry>) => {
    const updated = updateHistoryEntry(id, patch);
    setEntries(updated);
  }, []);

  const clearAll = useCallback(() => {
    clearAllHistory();
    setEntries([]);
    setSelectedIds(new Set());
  }, []);

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(paginatedEntries.map((e) => e.id)));
  }, [paginatedEntries]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const isAllSelected =
    paginatedEntries.length > 0 &&
    paginatedEntries.every((e) => selectedIds.has(e.id));

  return {
    // Data
    allEntries: entries,
    filteredEntries: sortedEntries,
    paginatedEntries,
    totalCount: entries.length,
    filteredCount: sortedEntries.length,
    // Pagination
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    // Filters
    filters,
    setFilter,
    resetFilters,
    // Sort
    sortField,
    sortDirection,
    handleSort,
    // Selection
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isAllSelected,
    // Actions
    deleteSelected,
    deleteOne,
    toggleFavorite,
    updateEntry,
    clearAll,
    refresh,
  };
}
