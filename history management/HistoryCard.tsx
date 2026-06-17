import React, { useState } from 'react';
import { HistoryEntry, ContentType } from '../../types/history';

interface Props {
  entry: HistoryEntry;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onView: (entry: HistoryEntry) => void;
  onCopy: (text: string) => void;
}

const TYPE_CONFIG: Record<ContentType, { label: string; color: string; icon: string }> = {
  blog: { label: 'Blog', color: '#6366f1', icon: '📝' },
  social: { label: 'Social', color: '#0ea5e9', icon: '📱' },
  email: { label: 'Email', color: '#f59e0b', icon: '📧' },
  ad: { label: 'Ad', color: '#ec4899', icon: '📣' },
  product: { label: 'Product', color: '#10b981', icon: '🛍️' },
  'video-script': { label: 'Video', color: '#8b5cf6', icon: '🎬' },
  other: { label: 'Other', color: '#6b7280', icon: '✦' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const HistoryCard: React.FC<Props> = ({
  entry,
  isSelected,
  onToggleSelect,
  onDelete,
  onToggleFavorite,
  onView,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const typeConfig = TYPE_CONFIG[entry.contentType] ?? TYPE_CONFIG.other;

  const handleCopy = () => {
    onCopy(entry.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(entry.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  const preview = entry.output.length > 160
    ? entry.output.slice(0, 160).replace(/\s\w+$/, '') + '…'
    : entry.output || '— no output —';

  return (
    <div
      className={`history-card${isSelected ? ' history-card--selected' : ''}${entry.status === 'failed' ? ' history-card--failed' : ''}`}
      onClick={() => onView(entry)}
    >
      {/* Selection checkbox */}
      <label
        className="history-card__checkbox"
        onClick={(e) => e.stopPropagation()}
        title="Select"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(entry.id)}
        />
        <span className="history-card__checkmark" />
      </label>

      {/* Header */}
      <div className="history-card__header">
        <span
          className="history-card__badge"
          style={{ '--badge-color': typeConfig.color } as React.CSSProperties}
        >
          {typeConfig.icon} {typeConfig.label}
        </span>

        {entry.status === 'failed' && (
          <span className="history-card__status-badge history-card__status-badge--failed">
            Failed
          </span>
        )}

        <button
          className={`history-card__favorite${entry.isFavorite ? ' history-card__favorite--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(entry.id); }}
          title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {entry.isFavorite ? '★' : '☆'}
        </button>
      </div>

      {/* Title */}
      <h3 className="history-card__title">{entry.title}</h3>

      {/* Prompt preview */}
      <p className="history-card__prompt">
        <span className="history-card__prompt-label">Prompt:</span>{' '}
        {entry.prompt.length > 100 ? entry.prompt.slice(0, 100) + '…' : entry.prompt}
      </p>

      {/* Output preview */}
      {entry.status !== 'failed' && (
        <p className="history-card__preview">{preview}</p>
      )}

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="history-card__tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="history-card__tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="history-card__footer">
        <div className="history-card__meta">
          <span>{formatDate(entry.createdAt)}</span>
          {entry.wordCount != null && entry.wordCount > 0 && (
            <>
              <span className="history-card__dot">·</span>
              <span>{entry.wordCount.toLocaleString()} words</span>
            </>
          )}
          {entry.tokensUsed != null && entry.tokensUsed > 0 && (
            <>
              <span className="history-card__dot">·</span>
              <span>{entry.tokensUsed.toLocaleString()} tokens</span>
            </>
          )}
        </div>

        <div className="history-card__actions" onClick={(e) => e.stopPropagation()}>
          {entry.status === 'success' && (
            <button
              className="history-card__action-btn"
              onClick={handleCopy}
              title="Copy output"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
          <button
            className="history-card__action-btn"
            onClick={() => onView(entry)}
            title="View details"
          >
            View
          </button>
          <button
            className={`history-card__action-btn history-card__action-btn--danger${confirmDelete ? ' confirm' : ''}`}
            onClick={handleDelete}
            title="Delete"
          >
            {confirmDelete ? 'Confirm?' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
