'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { domainOptions, deliveryModeOptions } from '@/lib/content/enquiryOptions';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  if (!isOpen) return null;

  function updateField<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Native HTML validation (required/type/pattern/min on the fields below)
    // already blocks submission with invalid data before this handler runs.
    setStatus('submitting');

    // TODO(backend owner): replace this block with a real submission, e.g.:
    //   const response = await fetch('/api/enquire', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       ...form,
    //       candidatesCount: form.candidatesCount ? Number(form.candidatesCount) : undefined,
    //     }),
    //   });
    //   if (!response.ok) { setStatus('idle'); return; }
    setStatus('success');
    setForm(initialForm);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Enquire Now</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close enquiry form"
            className="text-2xl leading-none text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Thanks — we've got it.</p>
            <p className="mt-2 text-sm text-slate-500">Our team will follow up within two business days.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Name">
              <input
                className="input"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter name"
              />
            </Field>
            <Field label="Email">
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Enter email"
              />
            </Field>
            <Field label="Phone">
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
            <Field label="Company name">
              <input
                className="input"
                required
                minLength={2}
                value={form.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Enter company name"
              />
            </Field>
            <Field label="Domain">
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
            <Field label="Number of candidates">
              <input
                className="input"
                type="number"
                min={1}
                value={form.candidatesCount}
                onChange={(e) => updateField('candidatesCount', e.target.value)}
                placeholder="Enter number of candidates"
              />
            </Field>
            <Field label="Mode of delivery">
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
            <Field label="Location">
              <input
                className="input"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Eg: Gurugram, Delhi, India"
              />
            </Field>

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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
