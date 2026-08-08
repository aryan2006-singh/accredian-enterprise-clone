# Ascentra Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Ascentra enterprise-learning landing page (13 sections + an "Enquire Now" lead-form UI) into the existing Next.js scaffold, replacing the current placeholder `app/page.tsx`.

**Architecture:** Server Components for static sections reading from typed `lib/content/*` data files; a small client-side context (`EnquiryModalProvider`) shares one modal instance across the Navbar/Hero/CTA banner "Enquire Now" buttons. The modal is a self-contained UI with native HTML validation and a placeholder submit handler — no backend call.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS.

## Scope note (amended 2026-08-09, then reversed 2026-08-09)

The backend for the lead form — Zod validation schema, Supabase server
client, the `/api/enquire` route handler, and `supabase/schema.sql` — was
originally ruled out of scope for this plan. **That was reversed the same
day**: the user asked for the backend to be built after all. It was added
directly, outside this task-by-task plan (all 15 tasks below were already
complete): `lib/validation/enquiry.ts` (+ `lib/validation/enquiry.test.ts`),
`lib/supabase/serverClient.ts`, `app/api/enquire/route.ts`, and
`supabase/schema.sql`. `EnquiryModal.tsx`'s submit handler (Task 1, Step 2 —
see below for its now-superseded original placeholder text) was rewired to
call the real endpoint with field-level error handling. `vitest.config.ts`
gained a `resolve.alias` for `@` so the new tests can import via the `@/*`
alias, same as the app code does.

The task text below (all still historically accurate for Tasks 1-15) should
be read with this in mind: Task 1's brief describes and mandates a
backend-free placeholder submit handler — that description no longer
matches the code on disk.

## Global Constraints

- Next.js 14 App Router conventions: Server Components by default; add `'use client'` only to files that use hooks, state, or context.
- Styling uses Tailwind utility classes only, restricted to the existing `brand` color scale and `slate`/`white` neutrals already defined in `tailwind.config.ts` — no new colors.
- No new npm dependencies. In particular: no `zod` usage and no `@supabase/supabase-js` usage anywhere in this plan's tasks (see Scope note above).
- No real Accredian trademarks, real client logos, or real testimonials. Ascentra brand only; partner names and testimonials are fictional and disclosed as illustrative in the Footer.
- No stock photography or external image/network fetches. Visuals are CSS/SVG only.
- Import via the `@/*` path alias (maps to project root per `tsconfig.json`), e.g. `@/lib/...`, `@/components/...`.
- No test framework changes. `vitest.config.ts`'s `lib/**/*.test.ts` scope stays as-is; this plan adds no test files since it adds no logic under `lib/` beyond static content data.

---

### Task 1: Enquiry modal + shared context (frontend-only)

**Files:**
- Create: `lib/content/enquiryOptions.ts`
- Create: `components/EnquiryModalProvider.tsx`
- Create: `components/EnquiryModal.tsx`
- Modify: `app/globals.css` (add a reusable `.input` form-field style)

**Interfaces:**
- Produces: `domainOptions: readonly string[]`, `deliveryModeOptions: readonly string[]` (from `lib/content/enquiryOptions.ts`)
- Produces: `EnquiryModalProvider` component and `useEnquiryModal(): { open: () => void }` hook (from `@/components/EnquiryModalProvider`) — used by Task 2 (Navbar), Task 3 (Hero), Task 13 (CtaBanner), and Task 15 (root layout)

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

- [ ] **Step 2: Add the shared input style**

Append to `app/globals.css`:
```css

@layer components {
    .input {
        @apply w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500;
    }
}
```

- [ ] **Step 3: Create the modal component**

`components/EnquiryModal.tsx`. Validation is native-HTML only (`required`,
`type="email"`, `pattern`, `min`) — no Zod. The submit handler does not call
any API; it simulates a success state locally so the UI is complete on its
own, with a `// TODO` comment marking where a real submission call belongs:

```tsx
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
```

- [ ] **Step 4: Create the provider/context**

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

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (`EnquiryModalProvider` isn't wired into the app yet — that's Task 15 — so nothing renders it yet; that's expected at this point.)

- [ ] **Step 6: Commit**

```bash
git add lib/content/enquiryOptions.ts components/EnquiryModal.tsx components/EnquiryModalProvider.tsx app/globals.css
git commit -m "feat: add Enquiry modal UI and shared modal context"
```

---

### Task 2: Navbar section

**Files:**
- Create: `lib/content/nav.ts`
- Create: `components/sections/Navbar.tsx`

**Interfaces:**
- Consumes: `useEnquiryModal()` from `@/components/EnquiryModalProvider` (Task 1)
- Produces: default-exported `Navbar` component — used by Task 15 (page composition)

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

### Task 3: Hero section

**Files:**
- Create: `lib/content/hero.ts`
- Create: `components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `useEnquiryModal()` from `@/components/EnquiryModalProvider` (Task 1)
- Produces: default-exported `Hero` component with `id="home"` root section — used by Task 15

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

### Task 4: Stats section

**Files:**
- Create: `lib/content/stats.ts`
- Create: `components/sections/Stats.tsx`

**Interfaces:**
- Produces: default-exported `Stats` component with `id="stats"` root section — used by Task 15

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

### Task 5: Trust strip section

**Files:**
- Create: `lib/content/partners.ts`
- Create: `components/sections/TrustStrip.tsx`

**Interfaces:**
- Produces: default-exported `TrustStrip` component with `id="partners"` root section — used by Task 15

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

### Task 6: Edge highlights section

**Files:**
- Create: `lib/content/edge.ts`
- Create: `components/sections/EdgeHighlights.tsx`

**Interfaces:**
- Produces: default-exported `EdgeHighlights` component — used by Task 15

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

### Task 7: Domain expertise section

**Files:**
- Create: `lib/content/programs.ts`
- Create: `components/sections/DomainExpertise.tsx`

**Interfaces:**
- Produces: default-exported `DomainExpertise` component with `id="programs"` root section — used by Task 15

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

### Task 8: Course segmentation section

**Files:**
- Create: `lib/content/segmentation.ts`
- Create: `components/sections/CourseSegmentation.tsx`

**Interfaces:**
- Produces: default-exported `CourseSegmentation` component — used by Task 15

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

### Task 9: Who should join section

**Files:**
- Create: `lib/content/audiences.ts`
- Create: `components/sections/WhoShouldJoin.tsx`

**Interfaces:**
- Produces: default-exported `WhoShouldJoin` component — used by Task 15

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

### Task 10: Framework section

**Files:**
- Create: `lib/content/framework.ts`
- Create: `components/sections/Framework.tsx`

**Interfaces:**
- Produces: default-exported `Framework` component with `id="framework"` root section — used by Task 15

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

### Task 11: FAQ section

**Files:**
- Create: `lib/content/faqs.ts`
- Create: `components/sections/Faq.tsx`

**Interfaces:**
- Produces: default-exported `Faq` component with `id="faqs"` root section — used by Task 15

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

### Task 12: Testimonials section

**Files:**
- Create: `lib/content/testimonials.ts`
- Create: `components/sections/Testimonials.tsx`

**Interfaces:**
- Produces: default-exported `Testimonials` component with `id="testimonials"` root section — used by Task 15

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

### Task 13: CTA banner section

**Files:**
- Create: `components/sections/CtaBanner.tsx`

**Interfaces:**
- Consumes: `useEnquiryModal()` from `@/components/EnquiryModalProvider` (Task 1)
- Produces: default-exported `CtaBanner` component — used by Task 15

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

### Task 14: Footer section

**Files:**
- Create: `lib/content/footer.ts`
- Create: `components/sections/Footer.tsx`

**Interfaces:**
- Produces: default-exported `Footer` component — used by Task 15

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

### Task 15: Wire up the page, root layout, and README

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Create: `README.md`

**Interfaces:**
- Consumes: every section component from Tasks 2–14; `EnquiryModalProvider` from Task 1

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
```

## Development

```bash
npm run dev      # start the dev server at http://localhost:3000
npm run lint     # run eslint
npm run build    # production build
```

## Project structure

- `app/` — Next.js App Router pages
- `components/sections/` — one presentational component per landing-page section
- `components/Enquiry*.tsx` — the lead-capture modal UI and its shared context
- `lib/content/` — typed copy/data for each section

## Backend (not included)

The "Enquire Now" form (`components/EnquiryModal.tsx`) currently validates
input with native HTML attributes and simulates a successful submission
locally — it does not call an API. To persist real leads, add:

- A Zod validation schema for the form payload
- A Supabase server client (using a service-role key, server-only)
- A `POST /api/enquire` route handler that validates and inserts into a
  Supabase table
- The table's SQL schema (see the form fields in `EnquiryModal.tsx` for the
  expected shape: name, email, phone, company, domain, candidatesCount,
  deliveryMode, location)

The exact `fetch` call to wire in is left as a `// TODO` comment in
`EnquiryModal.tsx`'s submit handler. `.env.example` already lists the
Supabase environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
expected for this.
```

- [ ] **Step 4: Full verification**

Run, in order:
```bash
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all three commands exit with status 0 — no type errors, no lint errors, and the production build succeeds.

- [ ] **Step 5: Manual smoke check**

Run: `npm run dev`, open `http://localhost:3000`, and confirm:
- All 13 sections render in order with no console errors.
- Each Navbar link scrolls to the matching section (anchors: `#home`, `#stats`, `#partners`, `#programs`, `#framework`, `#faqs`, `#testimonials`).
- Clicking "Enquire Now" (Navbar, Hero, or CTA banner) opens the same modal.
- Submitting the form with empty required fields is blocked by native browser validation (no submission).
- Submitting a fully valid form shows the local success state (no network call is made — open DevTools Network tab and confirm nothing hits `/api/enquire`).
Stop the dev server (Ctrl+C) when done.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/layout.tsx README.md
git commit -m "feat: wire up Ascentra landing page and add README"
```
