import React from 'react';
import { ContentType, GenerationStatus, HistoryFilters } from '../../types/history';

interface Props {
  filters: HistoryFilters;
  totalCount: number;
  filteredCount: number;
  onFilterChange: <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => void;
  onReset: () => void;
}

const CONTENT_TYPE_LABELS: Record<ContentType | 'all', string> = {
  all: 'All types',
  blog: 'Blog post',
  social: 'Social media',
  email: 'Email',
  ad: 'Ad copy',
  product: 'Product desc.',
  'video-script': 'Video script',
  other: 'Other',
};

const STATUS_LABELS: Record<GenerationStatus | 'all', string> = {
  all: 'All statuses',
  success: 'Succeeded',
  failed: 'Failed',
  'in-progress': 'In progress',
};

const DATE_RANGE_LABELS = {
  all: 'All time',
  today: 'Today',
  week: 'This week',
  month: 'This month',
};

export const HistoryFiltersBar: React.FC<Props> = ({
  filters,
  totalCount,
  filteredCount,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.contentType !== 'all' ||
    filters.status !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.favoritesOnly;

  return (
    <div className="history-filters">
      {/* Search */}
      <div className="filter-search-wrap">
        <span className="filter-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          className="filter-search"
          type="text"
          placeholder="Search by title, prompt, or tag…"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
        {filters.search && (
          <button className="filter-search-clear" onClick={() => onFilterChange('search', '')}>
            ✕
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <div className="filter-selects">
        <select
          className="filter-select"
          value={filters.contentType}
          onChange={(e) => onFilterChange('contentType', e.target.value as ContentType | 'all')}
        >
          {Object.entries(CONTENT_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value as GenerationStatus | 'all')}
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.dateRange}
          onChange={(e) => onFilterChange('dateRange', e.target.value as HistoryFilters['dateRange'])}
        >
          {Object.entries(DATE_RANGE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(e) => onFilterChange('favoritesOnly', e.target.checked)}
          />
          <span className="filter-toggle-star">★</span>
          Favorites only
        </label>
      </div>

      {/* Result count + reset */}
      <div className="filter-meta">
        <span className="filter-count">
          {filteredCount === totalCount
            ? `${totalCount} generation${totalCount !== 1 ? 's' : ''}`
            : `${filteredCount} of ${totalCount}`}
        </span>
        {hasActiveFilters && (
          <button className="filter-reset-btn" onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};
