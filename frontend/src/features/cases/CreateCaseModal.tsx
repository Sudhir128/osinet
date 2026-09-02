/**
 * OSINET Frontend — Create Case Form Modal
 */
import React, { useState, type FormEvent } from 'react';
import { X, FolderOpen, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import type { CreateCaseFormData } from '../../types';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const INITIAL_FORM: CreateCaseFormData = {
  title: '',
  client_ref: '',
  priority: 'MEDIUM',
  jurisdiction: '',
  description: '',
  retention_at: '',
};

export default function CreateCaseModal({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<CreateCaseFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
    if (form.title.trim().length > 200) errors.title = 'Title cannot exceed 200 characters';
    if (form.retention_at && isNaN(new Date(form.retention_at).getTime())) {
      errors.retention_at = 'Must be a valid date';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string> = { title: form.title.trim(), priority: form.priority };
      if (form.client_ref.trim()) payload.client_ref = form.client_ref.trim();
      if (form.jurisdiction.trim()) payload.jurisdiction = form.jurisdiction.trim();
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.retention_at) payload.retention_at = new Date(form.retention_at).toISOString();

      await api.post('/cases', payload);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to create case';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateCaseFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FolderOpen size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="modal-title">New Investigation Case</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onCancel} id="create-case-cancel" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="create-case-form">
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label required" htmlFor="case-title">Case Title</label>
                <input
                  id="case-title"
                  type="text"
                  className={`form-input${fieldErrors.title ? ' error' : ''}`}
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Investigation into Company XYZ"
                  disabled={submitting}
                />
                {fieldErrors.title && <span className="form-error">{fieldErrors.title}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="case-ref">Client Reference</label>
                  <input
                    id="case-ref"
                    type="text"
                    className="form-input"
                    value={form.client_ref}
                    onChange={(e) => handleChange('client_ref', e.target.value)}
                    placeholder="e.g. CLIENT-2024-001"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required" htmlFor="case-priority">Priority</label>
                  <select
                    id="case-priority"
                    className="form-select"
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    disabled={submitting}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="case-jurisdiction">Jurisdiction</label>
                  <input
                    id="case-jurisdiction"
                    type="text"
                    className="form-input"
                    value={form.jurisdiction}
                    onChange={(e) => handleChange('jurisdiction', e.target.value)}
                    placeholder="e.g. US, EU, UK"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="case-retention">Retention Until</label>
                  <input
                    id="case-retention"
                    type="date"
                    className={`form-input${fieldErrors.retention_at ? ' error' : ''}`}
                    value={form.retention_at}
                    onChange={(e) => handleChange('retention_at', e.target.value)}
                    disabled={submitting}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {fieldErrors.retention_at && (
                    <span className="form-error">{fieldErrors.retention_at}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="case-description">Description</label>
                <textarea
                  id="case-description"
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of the investigation objectives..."
                  disabled={submitting}
                  rows={3}
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
              id="create-case-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="create-case-submit"
            >
              {submitting ? (
                <><div className="spinner" style={{ width: '14px', height: '14px' }} />Creating...</>
              ) : (
                <><FolderOpen size={15} />Create Case</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
