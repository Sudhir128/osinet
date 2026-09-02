/**
 * OSINET Frontend — Add Target Modal
 */
import React, { useState, type FormEvent } from 'react';
import { X, Target, AlertCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import type { CreateTargetFormData, TargetType } from '../../types';

interface Props {
  caseId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TARGET_TYPES: TargetType[] = [
  'PERSON', 'EMAIL', 'PHONE', 'USERNAME', 'DOMAIN', 'IP', 'COMPANY', 'URL',
];

const TYPE_PLACEHOLDERS: Record<TargetType, string> = {
  PERSON: 'John Smith',
  EMAIL: 'john.smith@example.com',
  PHONE: '+14155552671 (use E.164 format)',
  USERNAME: 'investigator42',
  DOMAIN: 'example.com',
  IP: '192.168.1.1 or 2001:db8::1',
  COMPANY: 'Example Corp Ltd',
  URL: 'https://example.com/page',
};

export default function AddTargetModal({ caseId, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<CreateTargetFormData>({
    type: 'EMAIL',
    raw_value: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.raw_value.trim()) errors.raw_value = 'Target value is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    setWarnings([]);
    try {
      const { data } = await api.post(`/cases/${caseId}/targets`, {
        type: form.type,
        raw_value: form.raw_value.trim(),
        notes: form.notes?.trim() || undefined,
      });

      const w = data.data?.normalization_warnings ?? [];
      if (w.length > 0) {
        setWarnings(w);
        // Show warnings but still succeed
        setTimeout(onSuccess, 2000);
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to add target';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Target size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="modal-title">Add Investigation Target</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onCancel} id="add-target-cancel" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="add-target-form">
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Normalization warnings</div>
                  {warnings.map((w, i) => <div key={i} style={{ fontSize: '0.8125rem' }}>{w}</div>)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label required" htmlFor="target-type">Target Type</label>
                <select
                  id="target-type"
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as TargetType, raw_value: '' }))}
                  disabled={submitting}
                >
                  {TARGET_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required" htmlFor="target-value">Target Value</label>
                <input
                  id="target-value"
                  type="text"
                  className={`form-input${fieldErrors.raw_value ? ' error' : ''}`}
                  value={form.raw_value}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, raw_value: e.target.value }));
                    if (fieldErrors.raw_value) setFieldErrors({});
                  }}
                  placeholder={TYPE_PLACEHOLDERS[form.type]}
                  disabled={submitting}
                />
                {fieldErrors.raw_value && (
                  <span className="form-error">{fieldErrors.raw_value}</span>
                )}
                <span className="form-hint">
                  The value will be automatically normalized and validated.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="target-notes">Notes (optional)</label>
                <textarea
                  id="target-notes"
                  className="form-textarea"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional context about this target..."
                  rows={2}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
              id="cancel-target-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="submit-target-btn"
            >
              {submitting ? (
                <><div className="spinner" style={{ width: '14px', height: '14px' }} />Adding...</>
              ) : (
                <><Target size={15} />Add Target</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
