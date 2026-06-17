import React, { useState, useEffect } from 'react';
import { HistoryEntry } from '../../types/history';

interface Props {
  entry: HistoryEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const HistoryDetailModal: React.FC<Props> = ({
  entry,
  onClose,
  onDelete,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState<'prompt' | 'output' | null>(null);
  const [tab, setTab] = useState<'output' | 'prompt' | 'meta'>('output');

  useEffect(() => {
    if (!entry) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [entry, onClose]);

  if (!entry) return null;

  const copy = (text: string, key: 'prompt' | 'output') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        {/* Modal header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <button
              className={`modal__fav${entry.isFavorite ? ' modal__fav--active' : ''}`}
              onClick={() => onToggleFavorite(entry.id)}
              title={entry.isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              {entry.isFavorite ? '★' : '☆'}
            </button>
            <h2 className="modal__title">{entry.title}</h2>
          </div>
          <div className="modal__header-right">
            <button
              className="modal__delete-btn"
              onClick={() => { onDelete(entry.id); onClose(); }}
            >
              Delete
            </button>
            <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="modal__tabs">
          {(['output', 'prompt', 'meta'] as const).map((t) => (
            <button
              key={t}
              className={`modal__tab${tab === t ? ' modal__tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'output' ? 'Generated output' : t === 'prompt' ? 'Prompt' : 'Details'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="modal__body">
          {tab === 'output' && (
            <div className="modal__content-block">
              <div className="modal__content-header">
                <span className="modal__content-label">Output</span>
                <button
                  className="modal__copy-btn"
                  onClick={() => copy(entry.output, 'output')}
                >
                  {copied === 'output' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              {entry.status === 'failed' ? (
                <div className="modal__empty-state modal__empty-state--error">
                  <span>⚠</span>
                  <p>This generation failed and produced no output.</p>
                </div>
              ) : (
                <pre className="modal__output">{entry.output}</pre>
              )}
            </div>
          )}

          {tab === 'prompt' && (
            <div className="modal__content-block">
              <div className="modal__content-header">
                <span className="modal__content-label">Your prompt</span>
                <button
                  className="modal__copy-btn"
                  onClick={() => copy(entry.prompt, 'prompt')}
                >
                  {copied === 'prompt' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="modal__output">{entry.prompt}</pre>
            </div>
          )}

          {tab === 'meta' && (
            <div className="modal__meta-grid">
              <MetaRow label="Content type" value={entry.contentType} />
              <MetaRow label="Status" value={entry.status} />
              <MetaRow label="Model" value={entry.model ?? '—'} />
              <MetaRow
                label="Created"
                value={new Date(entry.createdAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              />
              <MetaRow label="Word count" value={(entry.wordCount ?? 0).toLocaleString()} />
              <MetaRow label="Character count" value={(entry.charCount ?? 0).toLocaleString()} />
              <MetaRow label="Tokens used" value={(entry.tokensUsed ?? 0).toLocaleString()} />
              {entry.tags && entry.tags.length > 0 && (
                <MetaRow label="Tags" value={entry.tags.map((t) => `#${t}`).join(', ')} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="modal__meta-row">
    <dt className="modal__meta-label">{label}</dt>
    <dd className="modal__meta-value">{value}</dd>
  </div>
);
