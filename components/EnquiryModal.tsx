'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { enquirySchema } from '@/lib/validation/enquiry';
import { domainOptions, deliveryModeOptions } from '@/lib/content/enquiryOptions';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FieldKey =
  | 'name'
  | 'email'
  | 'phone'
  | 'company'
  | 'domain'
  | 'candidatesCount'
  | 'deliveryMode'
  | 'location';

type FieldErrors = Partial<Record<FieldKey, string>>;

const initialForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  domain: '',
  candidatesCount: '',
  deliveryMode: '',
  location: '',
};

const TITLE_ID = 'enquiry-modal-title';

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset the form and close, so the next open always starts fresh — resetting
  // here (rather than in an effect keyed on `isOpen`) avoids a one-frame flash
  // of stale state, since the reset happens before the close is even requested.
  function handleClose() {
    setForm(initialForm);
    setFieldErrors({});
    setErrorMessage('');
    setStatus('idle');
    onClose();
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  function updateField<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    // Native HTML validation (required/type/pattern/min on the fields below)
    // already blocks submission with invalid data before this handler runs.
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      domain: form.domain,
      candidatesCount: form.candidatesCount ? Number(form.candidatesCount) : undefined,
      deliveryMode: form.deliveryMode,
      location: form.location || undefined,
    };

    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const nextErrors: FieldErrors = {};
      (Object.keys(flat) as FieldKey[]).forEach((key) => {
        const message = flat[key]?.[0];
        if (message) nextErrors[key] = message;
      });
      setFieldErrors(nextErrors);
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const responseBody = await response.json().catch(() => ({}));
        if (response.status === 400 && responseBody.fieldErrors) {
          const nextErrors: FieldErrors = {};
          Object.keys(responseBody.fieldErrors).forEach((key) => {
            const message = responseBody.fieldErrors[key]?.[0];
            if (message) nextErrors[key as FieldKey] = message;
          });
          setFieldErrors(nextErrors);
          setStatus('idle');
          return;
        }
        throw new Error(responseBody.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={TITLE_ID} className="text-xl font-bold text-slate-900">
            Enquire Now
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close enquiry form"
            className="text-2xl leading-none text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center" aria-live="polite">
            <p className="text-lg font-semibold text-slate-900">Thanks — we’ve got it.</p>
            <p className="mt-2 text-sm text-slate-500">Our team will follow up within two business days.</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Field label="Name" error={fieldErrors.name}>
              <input
                className="input"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter name"
              />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Enter email"
              />
            </Field>
            <Field label="Phone" error={fieldErrors.phone}>
              <input
                className="input"
                required
                pattern="^\+?[0-9\s-]{7,15}$"
                title="Enter a valid phone number"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Company name" error={fieldErrors.company}>
              <input
                className="input"
                required
                minLength={2}
                value={form.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Enter company name"
              />
            </Field>
            <Field label="Domain" error={fieldErrors.domain}>
              <select
                className="input"
                required
                value={form.domain}
                onChange={(e) => updateField('domain', e.target.value)}
              >
                <option value="" disabled>
                  Select domain
                </option>
                {domainOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Number of candidates" error={fieldErrors.candidatesCount}>
              <input
                className="input"
                type="number"
                min={1}
                value={form.candidatesCount}
                onChange={(e) => updateField('candidatesCount', e.target.value)}
                placeholder="Enter number of candidates"
              />
            </Field>
            <Field label="Mode of delivery" error={fieldErrors.deliveryMode}>
              <select
                className="input"
                required
                value={form.deliveryMode}
                onChange={(e) => updateField('deliveryMode', e.target.value)}
              >
                <option value="" disabled>
                  Select mode of delivery
                </option>
                {deliveryModeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location" error={fieldErrors.location}>
              <input
                className="input"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Eg: Gurugram, Delhi, India"
              />
            </Field>

            {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
