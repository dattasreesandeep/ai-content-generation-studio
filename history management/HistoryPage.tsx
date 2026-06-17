import React, { useState, useCallback } from 'react';
import { useHistory } from '../../hooks/useHistory';
import { HistoryFiltersBar } from './HistoryFiltersBar';
import { HistoryCard } from './HistoryCard';
import { HistoryDetailModal } from './HistoryDetailModal';
import { HistoryEntry, SortField } from '../../types/history';

export const HistoryPage: React.FC = () => {
  const {
    allEntries,
    filteredEntries,
    paginatedEntries,
    totalCount,
    filteredCount,
    page,
    setPage,
    totalPages,
    filters,
    setFilter,
    resetFilters,
    sortField,
    sortDirection,
    handleSort,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isAllSelected,
    deleteSelected,
    deleteOne,
    toggleFavorite,
    clearAll,
  } = useHistory();

  const [detailEntry, setDetailEntry] = useState<HistoryEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
  }, []);

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    deleteSelected();
    showToast(`Deleted ${count} generation${count !== 1 ? 's' : ''}`);
  };

  const handleDeleteOne = (id: string) => {
    deleteOne(id);
    showToast('Generation deleted');
  };

  const handleClearAll = () => {
    if (showClearConfirm) {
      clearAll();
      setShowClearConfirm(false);
      showToast('All history cleared');
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const SORT_OPTIONS: { field: SortField; label: string }[] = [
    { field: 'createdAt', label: 'Date' },
    { field: 'title', label: 'Title' },
    { field: 'contentType', label: 'Type' },
    { field: 'wordCount', label: 'Word count' },
  ];

  return (
    <div className="history-page">
      {/* Page header */}
      <div className="history-page__header">
        <div>
          <h1 className="history-page__title">Generation history</h1>
          <p className="history-page__subtitle">
            {totalCount === 0
              ? 'Your past generations will appear here.'
              : `${totalCount} generation${totalCount !== 1 ? 's' : ''} saved locally`}
          </p>
        </div>
        {totalCount > 0 && (
          <button
            className={`history-clear-btn${showClearConfirm ? ' history-clear-btn--confirm' : ''}`}
            onClick={handleClearAll}
          >
            {showClearConfirm ? 'Are you sure?' : 'Clear all'}
          </button>
        )}
      </div>

      {/* Filters */}
      <HistoryFiltersBar
        filters={filters}
        totalCount={totalCount}
        filteredCount={filteredCount}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      {/* Bulk toolbar */}
      {selectedIds.size > 0 && (
        <div className="history-toolbar">
          <span className="history-toolbar__count">
            {selectedIds.size} selected
          </span>
          <button className="history-toolbar__btn" onClick={clearSelection}>
            Deselect all
          </button>
          <button
            className="history-toolbar__btn history-toolbar__btn--danger"
            onClick={handleDeleteSelected}
          >
            Delete selected
          </button>
        </div>
      )}

      {/* Sort bar */}
      {filteredCount > 0 && (
        <div className="history-sort-bar">
          <span className="history-sort-bar__label">Sort by:</span>
          {SORT_OPTIONS.map(({ field, label }) => (
            <button
              key={field}
              className={`history-sort-btn${sortField === field ? ' history-sort-btn--active' : ''}`}
              onClick={() => handleSort(field)}
            >
              {label}
              {sortField === field && (
                <span className="history-sort-arrow">
                  {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                </span>
              )}
            </button>
          ))}

          {/* Select all on page */}
          <label className="history-select-all">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={isAllSelected ? clearSelection : selectAll}
            />
            <span>Select page</span>
          </label>
        </div>
      )}

      {/* Empty state */}
      {filteredCount === 0 && (
        <div className="history-empty">
          {totalCount === 0 ? (
            <>
              <div className="history-empty__icon">⚡</div>
              <h3>No generations yet</h3>
              <p>Head to the generator and create your first piece of content.</p>
            </>
          ) : (
            <>
              <div className="history-empty__icon">🔍</div>
              <h3>No results match your filters</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="history-empty__reset" onClick={resetFilters}>
                Clear filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Cards grid */}
      {filteredCount > 0 && (
        <div className="history-grid">
          {paginatedEntries.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              isSelected={selectedIds.has(entry.id)}
              onToggleSelect={toggleSelect}
              onDelete={handleDeleteOne}
              onToggleFavorite={toggleFavorite}
              onView={setDetailEntry}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="history-pagination">
          <button
            className="history-pagination__btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <div className="history-pagination__pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`history-pagination__page${p === page ? ' history-pagination__page--active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="history-pagination__btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail modal */}
      <HistoryDetailModal
        entry={detailEntry}
        onClose={() => setDetailEntry(null)}
        onDelete={(id) => { handleDeleteOne(id); setDetailEntry(null); }}
        onToggleFavorite={toggleFavorite}
      />

      {/* Toast */}
      {toast && (
        <div className="history-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
};
