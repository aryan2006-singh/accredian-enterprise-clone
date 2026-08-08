# Ascentra Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Ascentra enterprise-learning landing page (13 sections + a Supabase-backed "Enquire Now" lead form) into the existing Next.js scaffold, replacing the current placeholder `app/page.tsx`.

**Architecture:** Server Components for static sections reading from typed `lib/content/*` data files; a small client-side context (`EnquiryModalProvider`) shares one modal instance across the Navbar/Hero/CTA banner "Enquire Now" buttons; the modal posts to a Next.js Route Handler that validates with Zod and inserts into Supabase using a server-only service-role client.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zod, `@supabase/supabase-js`, Vitest.

## Global Constraints

- Next.js 14 App Router conventions: Server Components by default; add `'use client'` only to files that use hooks, state, or context.
- Styling uses Tailwind utility classes only, restricted to the existing `brand` color scale and `slate`/`white` neutrals already defined in `tailwind.config.ts` — no new colors.
- No new npm dependencies beyond what's already in `package.json`.
- No real Accredian trademarks, real client logos, or real testimonials. Ascentra brand only; partner names and testimonials are fictional and disclosed as illustrative in the Footer.
- No stock photography or external image/network fetches. Visuals are CSS/SVG only.
- Import via the `@/*` path alias (maps to project root per `tsconfig.json`), e.g. `@/lib/...`, `@/components/...`.
- Vitest scope stays `lib/**/*.test.ts` per the existing `vitest.config.ts` — no new test framework or config added.
- No `.env.local` is created by this plan — Supabase credentials are the user's manual setup step (documented in the README added in Task 18).

---

### Task 1: Enquiry validation schema

**Files:**
- Create: `lib/content/enquiryOptions.ts`
- Create: `lib/validation/enquiry.ts`
- Test: `lib/validation/enquiry.test.ts`

**Interfaces:**
- Produces: `domainOptions: readonly string[]`, `deliveryModeOptions: readonly string[]` (from `lib/content/enquiryOptions.ts`)
- Produces: `enquirySchema: ZodObject`, `type EnquiryInput` (from `lib/validation/enquiry.ts`) — used by Task 3 (API route) and Task 4 (EnquiryModal)

- [ ] **Step 1: Create the option lists**

`lib/content/enquiryOptions.ts`:
```ts
export const domainOptions = [
  'Product Management',
  'Data Science',
  'Artificial Intelligence',
  'Leadership & Strategy',
  'Human Resources',
  'Operations',
] as const;

export const deliveryModeOptions = ['Online', 'In-person', 'Hybrid'] as const;
```

- [ ] **Step 2: Write the failing test**

`lib/validation/enquiry.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { enquirySchema } from './enquiry';

const validPayload = {
  name: 'Jordan Lee',
  email: 'jordan.lee@example.com',
  phone: '+91 98765 43210',
  company: 'Sample Enterprise Co.',
  domain: 'Data Science',
  candidatesCount: 25,
  deliveryMode: 'Hybrid',
  location: 'Gurugram, India',
};

describe('enquirySchema', () => {
  it('accepts a fully valid payload', () => {
    const result = enquirySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('accepts a payload without optional fields', () => {
    const { candidatesCount, location, ...required } = validPayload;
    const result = enquirySchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it.each([
    ['name', ''],
    ['email', 'not-an-email'],
    ['phone', 'abc'],
    ['company', ''],
    ['domain', 'Not A Real Domain'],
    ['deliveryMode', 'By Carrier Pigeon'],
  ])('rejects an invalid %s', (field, value) => {
    const result = enquirySchema.safeParse({ ...validPayload, [field]: value });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive candidatesCount', () => {
    const result = enquirySchema.safeParse({ ...validPayload, candidatesCount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer candidatesCount', () => {
    const result = enquirySchema.safeParse({ ...validPayload, candidatesCount: 2.5 });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run lib/validation/enquiry.test.ts`
Expected: FAIL — `enquiry.ts` doesn't exist yet (module not found).

- [ ] **Step 4: Implement the schema**

`lib/validation/enquiry.ts`:
```ts
import { z } from 'zod';
import { domainOptions, deliveryModeOptions } from '@/lib/content/enquiryOptions';

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number'),
  company: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150),
  domain: z.enum(domainOptions, { errorMap: () => ({ message: 'Select a domain' }) }),
  candidatesCount: z
    .number({ invalid_type_error: 'Number of candidates must be a number' })
    .int('Number of candidates must be a whole number')
    .positive('Number of candidates must be greater than zero')
    .finite('Number of candidates must be a valid number')
    .optional(),
  deliveryMode: z.enum(deliveryModeOptions, {
    errorMap: () => ({ message: 'Select a delivery mode' }),
  }),
  location: z.string().trim().max(150).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/validation/enquiry.test.ts`
Expected: PASS (10 assertions across the listed cases).

- [ ] **Step 6: Commit**

```bash
git add lib/content/enquiryOptions.ts lib/validation/enquiry.ts lib/validation/enquiry.test.ts
git commit -m "feat: add enquiry validation schema"
```

---

### Task 2: Supabase server client + schema

**Files:**
- Create: `lib/supabase/serverClient.ts`
- Create: `supabase/schema.sql`

**Interfaces:**
- Produces: `getSupabaseServerClient(): SupabaseClient` (from `lib/supabase/serverClient.ts`) — used by Task 3 (API route)

- [ ] **Step 1: Write the server-only Supabase client**

`lib/supabase/serverClient.ts`:
```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseServerClient must only be called on the server.');
  }
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase server client is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  return client;
}
```

- [ ] **Step 2: Write the table schema**

`supabase/schema.sql`:
```sql
-- Run this once against your Supabase project (SQL Editor or `supabase db execute`).

create extension if not exists pgcrypto;

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text not null,
  domain text not null,
  candidates_count integer,
  delivery_mode text not null,
  location text,
  created_at timestamptz not null default now()
);

-- Row Level Security is enabled with no policies, so the anon/authenticated
-- API roles have zero access to this table. Only the server-side
-- service-role key (used in lib/supabase/serverClient.ts) can read/write it.
alter table enquiries enable row level security;
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/serverClient.ts supabase/schema.sql
git commit -m "feat: add Supabase server client and enquiries table schema"
```

---

### Task 3: Enquire API route

**Files:**
- Create: `app/api/enquire/route.ts`

**Interfaces:**
- Consumes: `enquirySchema` from `@/lib/validation/enquiry` (Task 1); `getSupabaseServerClient()` from `@/lib/supabase/serverClient` (Task 2)
- Produces: `POST /api/enquire` — `201 { id: string }` on success, `400 { error, fieldErrors }` on validation failure, `500 { error }` on server/database failure. Consumed by Task 4 (EnquiryModal).

- [ ] **Step 1: Implement the route handler**

`app/api/enquire/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { enquirySchema } from '@/lib/validation/enquiry';
import { getSupabaseServerClient } from '@/lib/supabase/serverClient';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        company: parsed.data.company,
        domain: parsed.data.domain,
        candidates_count: parsed.data.candidatesCount ?? null,
        delivery_mode: parsed.data.deliveryMode,
        location: parsed.data.location ?? null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error('Failed to save enquiry:', err);
    return NextResponse.json(
      { error: 'Something went wrong while saving your enquiry. Please try again shortly.' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/enquire/route.ts
git commit -m "feat: add /api/enquire route handler"
```

---

### Task 4: Enquiry modal + shared context

**Files:**
- Create: `components/EnquiryModalProvider.tsx`
- Create: `components/EnquiryModal.tsx`
- Modify: `app/globals.css` (add a reusable `.input` form-field style)

**Interfaces:**
- Consumes: `enquirySchema` from `@/lib/validation/enquiry` (Task 1); `domainOptions`, `deliveryModeOptions` from `@/lib/content/enquiryOptions` (Task 1); `POST /api/enquire` (Task 3)
- Produces: `EnquiryModalProvider` component and `useEnquiryModal(): { open: () => void }` hook (from `@/components/EnquiryModalProvider`) — used by Task 5 (Navbar), Task 6 (Hero), Task 16 (CtaBanner), and Task 18 (root layout)

- [ ] **Step 1: Add the shared input style**

Append to `app/globals.css`:
```css

@layer components {
    .input {
        @apply w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500;
    }
}
```

- [ ] **Step 2: Create the modal component**

`components/EnquiryModal.tsx`:
```tsx
'use client';

import { FormEvent, ReactNode, useState } from 'react';
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

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  function updateField<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

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
            <p className="text-lg font-semibold text-slate-900">Thanks — we’ve got it.</p>
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
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Field label="Name" error={fieldErrors.name}>
              <input
                className="input"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter name"
              />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Enter email"
              />
            </Field>
            <Field label="Phone" error={fieldErrors.phone}>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Company name" error={fieldErrors.company}>
              <input
                className="input"
                value={form.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Enter company name"
              />
            </Field>
            <Field label="Domain" error={fieldErrors.domain}>
              <select
                className="input"
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
```

- [ ] **Step 3: Create the provider/context**

`components/EnquiryModalProvider.tsx`:
```tsx
'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import EnquiryModal from './EnquiryModal';

interface EnquiryModalContextValue {
  open: () => void;
}

const EnquiryModalContext = createContext<EnquiryModalContextValue | null>(null);

export function EnquiryModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <EnquiryModalContext.Provider value={value}>
      {children}
      <EnquiryModal isOpen={isOpen} onClose={close} />
    </EnquiryModalContext.Provider>
  );
}

export function useEnquiryModal() {
  const context = useContext(EnquiryModalContext);
  if (!context) {
    throw new Error('useEnquiryModal must be used within an EnquiryModalProvider');
  }
  return context;
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (`EnquiryModalProvider` isn't wired into the app yet — that's Task 18 — so nothing renders it yet; that's expected at this point.)

- [ ] **Step 5: Commit**

```bash
git add components/EnquiryModal.tsx components/EnquiryModalProvider.tsx app/globals.css
git commit -m "feat: add Enquiry modal and shared modal context"
```

---

### Task 5: Navbar section

**Files:**
- Create: `lib/content/nav.ts`
- Create: `components/sections/Navbar.tsx`

**Interfaces:**
- Consumes: `useEnquiryModal()` from `@/components/EnquiryModalProvider` (Task 4)
- Produces: default-exported `Navbar` component — used by Task 18 (page composition)

- [ ] **Step 1: Create the nav link data**

`lib/content/nav.ts`:
```ts
export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'Stats', href: '#stats' },
  { label: 'Partners', href: '#partners' },
  { label: 'Programs', href: '#programs' },
  { label: 'Framework', href: '#framework' },
  { label: 'FAQs', href: '#faqs' },
  { label: 'Testimonials', href: '#testimonials' },
];
```

- [ ] **Step 2: Create the Navbar component**

`components/sections/Navbar.tsx`:
```tsx
'use client';

import { navLinks } from '@/lib/content/nav';
import { useEnquiryModal } from '@/components/EnquiryModalProvider';

export default function Navbar() {
  const { open } = useEnquiryModal();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#home" className="text-xl font-extrabold text-brand-600">
          Ascentra
        </a>
        <ul className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-brand-600">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={open}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Enquire Now
        </button>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/nav.ts components/sections/Navbar.tsx
git commit -m "feat: add Navbar section"
```

---

### Task 6: Hero section

**Files:**
- Create: `lib/content/hero.ts`
- Create: `components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `useEnquiryModal()` from `@/components/EnquiryModalProvider` (Task 4)
- Produces: default-exported `Hero` component with `id="home"` root section — used by Task 18

- [ ] **Step 1: Create the hero copy**

`lib/content/hero.ts`:
```ts
export const hero = {
  eyebrow: 'Enterprise Learning',
  headlineLead: 'Build Teams That',
  headlineHighlight: 'Outperform',
  subheadline:
    'Ascentra partners with enterprise teams to close skill gaps with structured, outcome-driven training programs.',
  highlights: ['Tailored Curricula', 'Practitioner-Led Sessions', 'Measurable Outcomes'],
};
```

- [ ] **Step 2: Create the Hero component**

`components/sections/Hero.tsx`:
```tsx
'use client';

import { hero } from '@/lib/content/hero';
import { useEnquiryModal } from '@/components/EnquiryModalProvider';

export default function Hero() {
  const { open } = useEnquiryModal();

  return (
    <section id="home" className="relative overflow-hidden bg-brand-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            {hero.headlineLead} <span className="text-brand-600">{hero.headlineHighlight}</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-slate-600">{hero.subheadline}</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {hero.highlights.map((item) => (
              <li
                key={item}
                className="rounded-full border border-brand-200 bg-white px-3 py-1 text-sm font-medium text-brand-700"
              >
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={open}
            className="mt-8 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Enquire Now
          </button>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div className="absolute inset-4 rounded-full bg-brand-100" />
          <div className="absolute inset-12 rounded-full bg-brand-200" />
          <div className="absolute inset-20 flex items-center justify-center rounded-full bg-brand-600 text-5xl font-extrabold text-white">
            A
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/hero.ts components/sections/Hero.tsx
git commit -m "feat: add Hero section"
```

---

### Task 7: Stats section

**Files:**
- Create: `lib/content/stats.ts`
- Create: `components/sections/Stats.tsx`

**Interfaces:**
- Produces: default-exported `Stats` component with `id="stats"` root section — used by Task 18

- [ ] **Step 1: Create the stats data**

`lib/content/stats.ts`:
```ts
export interface StatItem {
  value: string;
  label: string;
}

export const stats: StatItem[] = [
  { value: '250+', label: 'Enterprise teams trained across industries' },
  { value: '18', label: 'Domain-specific program tracks delivered' },
  { value: '92%', label: 'Learner satisfaction across cohorts' },
];
```

- [ ] **Step 2: Create the Stats component**

`components/sections/Stats.tsx`:
```tsx
import { stats } from '@/lib/content/stats';

export default function Stats() {
  return (
    <section id="stats" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our Track Record</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">The Numbers Behind Our Programs</h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl font-extrabold text-brand-600">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/stats.ts components/sections/Stats.tsx
git commit -m "feat: add Stats section"
```

---

### Task 8: Trust strip section

**Files:**
- Create: `lib/content/partners.ts`
- Create: `components/sections/TrustStrip.tsx`

**Interfaces:**
- Produces: default-exported `TrustStrip` component with `id="partners"` root section — used by Task 18

- [ ] **Step 1: Create the partner list (fictional companies)**

`lib/content/partners.ts`:
```ts
export const partners: string[] = [
  'NimbusTech',
  'Solstice Retail',
  'Ironclad Financial',
  'Meridian Health',
  'Vertex Industries',
  'Northgate Logistics',
];
```

- [ ] **Step 2: Create the TrustStrip component**

`components/sections/TrustStrip.tsx`:
```tsx
import { partners } from '@/lib/content/partners';

export default function TrustStrip() {
  return (
    <section id="partners" className="bg-slate-50 py-14">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our Partners</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Illustrative Enterprise Partners</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((partner) => (
            <span key={partner} className="text-lg font-semibold text-slate-400">
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/partners.ts components/sections/TrustStrip.tsx
git commit -m "feat: add TrustStrip section"
```

---

### Task 9: Edge highlights section

**Files:**
- Create: `lib/content/edge.ts`
- Create: `components/sections/EdgeHighlights.tsx`

**Interfaces:**
- Produces: default-exported `EdgeHighlights` component — used by Task 18

- [ ] **Step 1: Create the differentiator data**

`lib/content/edge.ts`:
```ts
export interface EdgeItem {
  title: string;
  description: string;
}

export const edgeHighlights: EdgeItem[] = [
  {
    title: 'Expert-Led Curriculum',
    description: 'Courses designed and taught by practitioners with real delivery experience.',
  },
  {
    title: 'Adaptive Delivery',
    description: "Live, self-paced, or blended formats that fit your team's schedule.",
  },
  {
    title: 'Outcome Tracking',
    description: 'Skill-gap assessments and progress reporting tied to business goals.',
  },
  {
    title: 'Dedicated Success Manager',
    description: 'A single point of contact from kickoff through program completion.',
  },
];
```

- [ ] **Step 2: Create the EdgeHighlights component**

`components/sections/EdgeHighlights.tsx`:
```tsx
import { edgeHighlights } from '@/lib/content/edge';

export default function EdgeHighlights() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">The Ascentra Edge</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Key Aspects of Our Strategic Training</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {edgeHighlights.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/edge.ts components/sections/EdgeHighlights.tsx
git commit -m "feat: add EdgeHighlights section"
```

---

### Task 10: Domain expertise section

**Files:**
- Create: `lib/content/programs.ts`
- Create: `components/sections/DomainExpertise.tsx`

**Interfaces:**
- Produces: default-exported `DomainExpertise` component with `id="programs"` root section — used by Task 18

- [ ] **Step 1: Create the program data**

`lib/content/programs.ts`:
```ts
export interface Program {
  title: string;
  description: string;
}

export const programs: Program[] = [
  { title: 'Product & Innovation', description: 'Product strategy, discovery, and roadmapping for cross-functional teams.' },
  { title: 'Gen-AI Fluency', description: 'Practical generative AI adoption for non-engineering and engineering teams alike.' },
  { title: 'Leadership Elevation', description: 'Decision-making, coaching, and communication for rising managers.' },
  { title: 'Data & Analytics', description: 'From data literacy to applied analytics for functional teams.' },
  { title: 'Operations Excellence', description: 'Process design and efficiency methods for operations teams.' },
  { title: 'Digital Enterprise', description: 'Digital transformation fundamentals for traditional business units.' },
];
```

- [ ] **Step 2: Create the DomainExpertise component**

`components/sections/DomainExpertise.tsx`:
```tsx
import { programs } from '@/lib/content/programs';

export default function DomainExpertise() {
  return (
    <section id="programs" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our Domain Expertise</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Specialized Programs Designed to Fuel Innovation</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <div key={program.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{program.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{program.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/programs.ts components/sections/DomainExpertise.tsx
git commit -m "feat: add DomainExpertise section"
```

---

### Task 11: Course segmentation section

**Files:**
- Create: `lib/content/segmentation.ts`
- Create: `components/sections/CourseSegmentation.tsx`

**Interfaces:**
- Produces: default-exported `CourseSegmentation` component — used by Task 18

- [ ] **Step 1: Create the segmentation data**

`lib/content/segmentation.ts`:
```ts
export interface SegmentCard {
  title: string;
  tags: string[];
}

export const segmentation: SegmentCard[] = [
  { title: 'Program Specific', tags: ['Certificate', 'Executive', 'Postgraduate Certificate'] },
  { title: 'Industry Specific', tags: ['IT', 'Healthcare', 'Retail', 'Finance', 'Manufacturing'] },
  { title: 'Topic Specific', tags: ['Machine Learning', 'Design', 'Analytics', 'Cybersecurity', 'Cloud'] },
  { title: 'Level Specific', tags: ['Senior Leadership', 'Mid-Career', 'Early Career'] },
];
```

- [ ] **Step 2: Create the CourseSegmentation component**

`components/sections/CourseSegmentation.tsx`:
```tsx
import { segmentation } from '@/lib/content/segmentation';

export default function CourseSegmentation() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Tailored Course Segmentation</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Explore Custom-Fit Courses for Every Focus</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {segmentation.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-brand-700">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.tags.join(', ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/segmentation.ts components/sections/CourseSegmentation.tsx
git commit -m "feat: add CourseSegmentation section"
```

---

### Task 12: Who should join section

**Files:**
- Create: `lib/content/audiences.ts`
- Create: `components/sections/WhoShouldJoin.tsx`

**Interfaces:**
- Produces: default-exported `WhoShouldJoin` component — used by Task 18

- [ ] **Step 1: Create the audience data**

`lib/content/audiences.ts`:
```ts
export interface Audience {
  title: string;
  description: string;
}

export const audiences: Audience[] = [
  { title: 'Tech Professionals', description: 'Deepen technical expertise and adopt emerging tools with confidence.' },
  { title: 'Non-Tech Professionals', description: 'Build digital fluency to collaborate effectively with technical teams.' },
  { title: 'Emerging Professionals', description: 'Develop foundational skills for rapid, sustainable career growth.' },
  { title: 'Senior Professionals', description: 'Sharpen strategic thinking and leadership for bigger mandates.' },
];
```

- [ ] **Step 2: Create the WhoShouldJoin component**

`components/sections/WhoShouldJoin.tsx`:
```tsx
import { audiences } from '@/lib/content/audiences';

export default function WhoShouldJoin() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-3xl bg-brand-600 px-6 py-12 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-100">Who Should Join?</p>
        <h2 className="mt-2 max-w-lg text-3xl font-bold">Strategic Skill Enhancement</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {audiences.map((audience) => (
            <div key={audience.title}>
              <h3 className="text-lg font-semibold">{audience.title}</h3>
              <p className="mt-1 text-sm text-brand-100">{audience.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/audiences.ts components/sections/WhoShouldJoin.tsx
git commit -m "feat: add WhoShouldJoin section"
```

---

### Task 13: Framework section

**Files:**
- Create: `lib/content/framework.ts`
- Create: `components/sections/Framework.tsx`

**Interfaces:**
- Produces: default-exported `Framework` component with `id="framework"` root section — used by Task 18

- [ ] **Step 1: Create the framework step data**

`lib/content/framework.ts`:
```ts
export interface FrameworkStep {
  step: number;
  title: string;
  description: string;
}

export const frameworkSteps: FrameworkStep[] = [
  { step: 1, title: 'Assess', description: "Identify skill gaps and training priorities against your team's goals." },
  { step: 2, title: 'Design', description: 'Build a customized program roadmap mapped to those priorities.' },
  { step: 3, title: 'Deliver', description: 'Run flexible, trackable sessions and report on measurable outcomes.' },
];
```

- [ ] **Step 2: Create the Framework component**

`components/sections/Framework.tsx`:
```tsx
import { frameworkSteps } from '@/lib/content/framework';

export default function Framework() {
  return (
    <section id="framework" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our Framework</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">How We Deliver Results That Matter</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {frameworkSteps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {step.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/framework.ts components/sections/Framework.tsx
git commit -m "feat: add Framework section"
```

---

### Task 14: FAQ section

**Files:**
- Create: `lib/content/faqs.ts`
- Create: `components/sections/Faq.tsx`

**Interfaces:**
- Produces: default-exported `Faq` component with `id="faqs"` root section — used by Task 18

- [ ] **Step 1: Create the FAQ data**

`lib/content/faqs.ts`:
```ts
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  category: string;
  items: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    category: 'About the Program',
    items: [
      {
        question: 'What types of corporate training programs does Ascentra offer?',
        answer:
          'Certificate, executive, and postgraduate-certificate programs across product, data, leadership, and technology domains.',
      },
      {
        question: 'Can programs be customized for our organization?',
        answer: 'Yes — every engagement starts with a skill-gap assessment and a tailored curriculum.',
      },
    ],
  },
  {
    category: 'About Delivery',
    items: [
      {
        question: 'What delivery formats are available?',
        answer: "Online, in-person, and hybrid formats, scheduled around your team's availability.",
      },
      {
        question: 'How long do programs typically run?',
        answer: 'Most engagements run 4–12 weeks, depending on scope and cohort size.',
      },
    ],
  },
  {
    category: 'Miscellaneous',
    items: [
      {
        question: 'How do we get started?',
        answer: 'Submit an enquiry through the form on this page and our team will follow up within two business days.',
      },
      {
        question: 'Is a minimum cohort size required?',
        answer: 'Most programs are designed for cohorts of 10 or more; smaller groups can be discussed on request.',
      },
    ],
  },
];
```

- [ ] **Step 2: Create the Faq component**

`components/sections/Faq.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { faqCategories } from '@/lib/content/faqs';

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].category);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const current = faqCategories.find((c) => c.category === activeCategory) ?? faqCategories[0];

  function selectCategory(category: string) {
    setActiveCategory(category);
    setOpenQuestion(null);
  }

  return (
    <section id="faqs" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Frequently Asked Questions</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Everything You Need to Know</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="flex gap-2 overflow-x-auto md:flex-col">
          {faqCategories.map((category) => (
            <button
              key={category.category}
              type="button"
              onClick={() => selectCategory(category.category)}
              className={`whitespace-nowrap rounded-lg border px-4 py-2 text-left text-sm font-medium ${
                category.category === activeCategory
                  ? 'border-brand-600 text-brand-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {current.items.map((item) => {
            const isOpen = openQuestion === item.question;
            return (
              <div key={item.question} className="rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-900"
                >
                  {item.question}
                  <span className="ml-4 text-slate-400">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p className="px-4 pb-4 text-sm text-slate-600">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/faqs.ts components/sections/Faq.tsx
git commit -m "feat: add FAQ section"
```

---

### Task 15: Testimonials section

**Files:**
- Create: `lib/content/testimonials.ts`
- Create: `components/sections/Testimonials.tsx`

**Interfaces:**
- Produces: default-exported `Testimonials` component with `id="testimonials"` root section — used by Task 18

- [ ] **Step 1: Create the testimonial data (fictional attributions)**

`lib/content/testimonials.ts`:
```ts
export interface Testimonial {
  quote: string;
  attribution: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "The program was tightly scoped to our team's actual gaps — nothing generic about it.",
    attribution: 'L&D Lead, Sample Enterprise Co.',
  },
  {
    quote: 'Sessions were practical from day one — our team was applying new skills within the first week.',
    attribution: 'Engineering Manager, Northgate Logistics',
  },
  {
    quote: 'Reporting made it easy to show leadership the impact of the investment.',
    attribution: 'HR Director, Meridian Health',
  },
];
```

- [ ] **Step 2: Create the Testimonials component**

`components/sections/Testimonials.tsx`:
```tsx
import { testimonials } from '@/lib/content/testimonials';

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">What Partner Teams Are Saying</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Illustrative testimonials for this demo project.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.attribution} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">&ldquo;{testimonial.quote}&rdquo;</p>
              <cite className="mt-4 block text-sm font-semibold not-italic text-slate-900">
                {testimonial.attribution}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/testimonials.ts components/sections/Testimonials.tsx
git commit -m "feat: add Testimonials section"
```

---

### Task 16: CTA banner section

**Files:**
- Create: `components/sections/CtaBanner.tsx`

**Interfaces:**
- Consumes: `useEnquiryModal()` from `@/components/EnquiryModalProvider` (Task 4)
- Produces: default-exported `CtaBanner` component — used by Task 18

- [ ] **Step 1: Create the CtaBanner component**

`components/sections/CtaBanner.tsx`:
```tsx
'use client';

import { useEnquiryModal } from '@/components/EnquiryModalProvider';

export default function CtaBanner() {
  const { open } = useEnquiryModal();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand-600 px-6 py-10 text-center text-white sm:flex-row sm:px-10 sm:text-left">
        <div>
          <h2 className="text-2xl font-bold">Want to Learn More About Our Training Solutions?</h2>
          <p className="mt-2 text-brand-100">Get expert guidance for your team’s success.</p>
        </div>
        <button
          type="button"
          onClick={open}
          className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Enquire Now
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/sections/CtaBanner.tsx
git commit -m "feat: add CtaBanner section"
```

---

### Task 17: Footer section

**Files:**
- Create: `lib/content/footer.ts`
- Create: `components/sections/Footer.tsx`

**Interfaces:**
- Produces: default-exported `Footer` component — used by Task 18

- [ ] **Step 1: Create the footer data**

`lib/content/footer.ts`:
```ts
export const footer = {
  brand: 'Ascentra',
  tagline: 'Enterprise learning programs for high-performance teams.',
  quickLinks: [
    { label: 'Home', href: '#home' },
    { label: 'Programs', href: '#programs' },
    { label: 'FAQs', href: '#faqs' },
  ],
  contactEmail: 'hello@ascentra.example',
  disclaimer:
    "Ascentra is an original, independent project built as a Full Stack Developer Intern assignment. It is a partial clone inspired by Accredian's enterprise page and is not affiliated with or endorsed by Accredian. Partner names and testimonials shown are illustrative placeholders.",
};
```

- [ ] **Step 2: Create the Footer component**

`components/sections/Footer.tsx`:
```tsx
import { footer } from '@/lib/content/footer';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div>
            <p className="text-xl font-extrabold text-brand-600">{footer.brand}</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">{footer.tagline}</p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-sm font-semibold text-slate-900">Quick Links</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                {footer.quickLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-brand-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Contact</p>
              <p className="mt-3 text-sm text-slate-500">{footer.contactEmail}</p>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">{footer.disclaimer}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content/footer.ts components/sections/Footer.tsx
git commit -m "feat: add Footer section"
```

---

### Task 18: Wire up the page, root layout, and README

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Create: `README.md`

**Interfaces:**
- Consumes: every section component from Tasks 5–17; `EnquiryModalProvider` from Task 4

- [ ] **Step 1: Compose the sections in `app/page.tsx`**

Replace the full contents of `app/page.tsx`:
```tsx
import Navbar from '@/components/sections/Navbar';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import TrustStrip from '@/components/sections/TrustStrip';
import EdgeHighlights from '@/components/sections/EdgeHighlights';
import DomainExpertise from '@/components/sections/DomainExpertise';
import CourseSegmentation from '@/components/sections/CourseSegmentation';
import WhoShouldJoin from '@/components/sections/WhoShouldJoin';
import Framework from '@/components/sections/Framework';
import Faq from '@/components/sections/Faq';
import Testimonials from '@/components/sections/Testimonials';
import CtaBanner from '@/components/sections/CtaBanner';
import Footer from '@/components/sections/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <TrustStrip />
        <EdgeHighlights />
        <DomainExpertise />
        <CourseSegmentation />
        <WhoShouldJoin />
        <Framework />
        <Faq />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Wrap the app in `EnquiryModalProvider` in `app/layout.tsx`**

Replace the full contents of `app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';
import { EnquiryModalProvider } from '@/components/EnquiryModalProvider';

export const metadata: Metadata = {
  title: 'Ascentra | Enterprise Learning Programs',
  description:
    'A partial clone of the Accredian Enterprise landing page, rebuilt with Next.js as a Full Stack Developer Intern assignment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <EnquiryModalProvider>{children}</EnquiryModalProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Add a project README**

`README.md`:
```md
# Ascentra Enterprise Landing Page

A partial clone of the Accredian Enterprise landing page, rebuilt with Next.js as a
Full Stack Developer Intern assignment. Original copy, original "Ascentra" branding,
fictional partners/testimonials — not affiliated with Accredian.

## Setup

```bash
npm install
cp .env.example .env.local
```

Then fill in `.env.local`:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase project's service-role key (server-side only, never exposed to the browser)

Run `supabase/schema.sql` once against your Supabase project (SQL Editor, or `supabase db execute -f supabase/schema.sql`) to create the `enquiries` table before submitting the Enquire Now form.

## Development

```bash
npm run dev      # start the dev server at http://localhost:3000
npm test         # run the Vitest suite (lib/**/*.test.ts)
npm run lint     # run eslint
npm run build    # production build
```

## Project structure

- `app/` — Next.js App Router pages and the `/api/enquire` route handler
- `components/sections/` — one presentational component per landing-page section
- `components/Enquiry*.tsx` — the lead-capture modal and its shared context
- `lib/content/` — typed copy/data for each section
- `lib/validation/` — the Zod schema for the enquiry form (shared by client and server)
- `lib/supabase/` — the server-only Supabase client
- `supabase/schema.sql` — DDL for the `enquiries` table
```

- [ ] **Step 4: Full verification**

Run, in order:
```bash
npx tsc --noEmit
npm run lint
npx vitest run
npm run build
```
Expected: all four commands exit with status 0 — no type errors, no lint errors, all Vitest tests pass, and the production build succeeds.

- [ ] **Step 5: Manual smoke check**

Run: `npm run dev`, open `http://localhost:3000`, and confirm:
- All 13 sections render in order with no console errors.
- Each Navbar link scrolls to the matching section (anchors: `#home`, `#stats`, `#partners`, `#programs`, `#framework`, `#faqs`, `#testimonials`).
- Clicking "Enquire Now" (Navbar, Hero, or CTA banner) opens the same modal.
- Submitting the form with empty fields shows inline field errors and does not submit.
- Submitting a valid form without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` configured shows the generic error message from the API route (expected until the user completes their manual Supabase setup).
Stop the dev server (Ctrl+C) when done.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/layout.tsx README.md
git commit -m "feat: wire up Ascentra landing page and add README"
```
