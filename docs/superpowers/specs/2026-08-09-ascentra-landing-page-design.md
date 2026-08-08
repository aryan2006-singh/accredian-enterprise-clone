# Ascentra Enterprise Landing Page — Design Spec

Date: 2026-08-09
Status: Approved

## Context

`accredian-enterprise-clone` is a Next.js 14 (App Router) scaffold, described in its own
metadata as *"a partial clone of the Accredian Enterprise landing page, rebuilt as a Full
Stack Developer Intern assignment"* under the brand name **Ascentra**. The scaffold
(TypeScript, Tailwind, Zod, `@supabase/supabase-js`, Vitest) exists but `app/page.tsx` is
still a placeholder (`"Sections coming soon."`) — no sections, components, or backend code
have been written yet.

The reference site, [enterprise.accredian.com](https://enterprise.accredian.com/), was
reviewed live (content + screenshots) to understand section structure, information
architecture, and the lead-capture form. That review is the basis for this spec.

**Explicit content decision:** the reference site's real client logos (IBM, Reliance, HCL,
CRIF, ADP, Bayer, ...) and named testimonials are **not** reused. Presenting real companies
as Ascentra's clients would misrepresent an actual business relationship that doesn't
exist. Ascentra's trust-strip and testimonials use clearly fictional company names. No
photography is scraped from the reference site either — hero/section visuals are built
from CSS/SVG only.

## Goals

- Build out the full landing page (all sections below) matching the reference site's
  information architecture, with original copy and an original visual identity (using the
  `brand` blue palette already defined in `tailwind.config.ts`).
- Implement a working lead-capture form ("Enquire Now") that validates input and persists
  it to Supabase via a server-side API route.
- Keep the codebase testable: validation logic lives in `lib/` and is covered by Vitest,
  matching the test scope already declared in `vitest.config.ts` (`lib/**/*.test.ts`).

## Non-goals

- No authentication, no CMS/admin UI for leads, no email notifications on submission.
- No creation of the actual Supabase project/table — the user runs `supabase/schema.sql`
  themselves in their own Supabase project (confirmed with user: they'll handle this step
  manually).
- No stock photography or icon libraries requiring network fetches at build time — icons
  are small inline SVGs.
- Pixel-perfect visual fidelity to the reference site is explicitly not a goal; matching
  its section structure and UX pattern is.

## Architecture

```
app/
  page.tsx                      composes all sections in order
  api/enquire/route.ts          POST handler: parse -> zod validate -> Supabase insert
components/
  sections/
    Navbar.tsx
    Hero.tsx
    Stats.tsx
    TrustStrip.tsx
    EdgeHighlights.tsx
    DomainExpertise.tsx
    CourseSegmentation.tsx
    WhoShouldJoin.tsx
    Framework.tsx
    Faq.tsx
    Testimonials.tsx
    CtaBanner.tsx
    Footer.tsx
  EnquiryModal.tsx               client component; the lead form + open/close state
  EnquiryModalProvider.tsx       client context so Navbar/Hero/CtaBanner buttons can
                                  all open the same modal instance
lib/
  content/
    stats.ts, partners.ts, programs.ts, segments.ts, audiences.ts,
    framework.ts, faqs.ts, testimonials.ts    -- typed copy/data arrays
  validation/
    enquiry.ts                   zod schema, shared by client + server
    enquiry.test.ts               vitest coverage
  supabase/
    serverClient.ts               server-only Supabase client (service-role key)
supabase/
  schema.sql                      `enquiries` table DDL — user runs manually
```

Each section is a small presentational component reading from its own `lib/content/*`
data file — copy changes don't touch component logic, and each section can be understood
without reading the others.

## Sections (content plan)

Mirrors the reference site's order. Copy below is directional, not final — final copy is
written during implementation.

1. **Navbar** — sticky, logo "Ascentra", anchor links (Home, Stats, Partners, Programs,
   Framework, FAQs, Testimonials), "Enquire Now" button (opens modal).
2. **Hero** — headline + subhead, 3 highlight pills, "Enquire Now" CTA, abstract SVG/CSS
   visual (no photography).
3. **Stats strip** — 3 metrics with captions (e.g. professionals trained, sessions
   delivered, active learners) — placeholder figures clearly framed as illustrative.
4. **Trust strip** — "Our Partners" heading + 5-6 **fictional** company wordmarks.
5. **Edge Highlights** — 3-4 differentiator cards (expert guidance, curriculum quality,
   proven impact, flexible delivery) — simplified to a grid, not the animated arc.
6. **Domain Expertise** — grid of ~6 program cards (Product & Innovation, Gen-AI, Leadership,
   Data & Tech, Operations, Digital Enterprise) with a one-line description each.
7. **Course Segmentation** — 4 cards: Program-specific, Industry-specific, Topic-specific,
   Level-specific, each with example tags.
8. **Who Should Join** — banner (brand-blue background) with 4 audience segments (Tech
   Professionals, Non-Tech Professionals, Emerging Professionals, Senior Professionals).
9. **Framework** — original 3-step process section (e.g. "Assess → Design → Deliver"),
   analogous to the reference's CAT framework but renamed/reworded.
10. **FAQ** — tabbed accordion (About the Program / About Delivery / Miscellaneous), ~2-3
    original Q&As per tab.
11. **Testimonials** — 3 short, clearly generic/fictional testimonials (e.g. attributed to
    "L&D Lead, Sample Enterprise Co." rather than a real person/company).
12. **CTA banner** — "Want to learn more?" + Enquire Now button.
13. **Footer** — brand, quick links, contact email (placeholder), copyright.

## Lead-capture form ("Enquire Now")

**Fields** (matches the reference form's field set, original labels/order preserved since
this is a generic business-form pattern, not copyrightable expression):
Name, Email, Phone (with country selector), Company name, Domain (select), Number of
candidates, Preferred delivery mode (select: Online / In-person / Hybrid), Location.

**Client** (`EnquiryModal.tsx`): controlled form, validates with the same Zod schema
on submit for immediate feedback, `fetch('/api/enquire', { method: 'POST', ... })`,
shows loading / success / inline field-error / generic-error states. On success, form
resets and shows a confirmation message; on error, entered values are preserved so the
user doesn't retype.

**Server** (`app/api/enquire/route.ts`):
1. Parse JSON body.
2. Validate with `lib/validation/enquiry.ts`'s zod schema — reject with `400` + field
   errors on failure.
3. Insert a row into Supabase's `enquiries` table using the **service-role** key via
   `lib/supabase/serverClient.ts` (server-only module — never imported by client
   components; guarded so a client-side import fails loudly rather than leaking the key).
4. Return `201` with the inserted id on success; `500` with a generic message (details
   logged server-side only) on Supabase/network failure.

**Schema** (`supabase/schema.sql`, for the user to run manually):
```sql
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
```

## Data flow

```
User fills EnquiryModal
  -> client-side zod validation (fast feedback)
  -> POST /api/enquire
  -> server-side zod validation (source of truth)
  -> insert into Supabase `enquiries` (service-role client)
  -> 201 { id } -----------------> modal shows success, resets form
  -> 400 { fieldErrors } --------> modal highlights invalid fields, keeps input
  -> 500 { error: generic msg } -> modal shows retry message, keeps input
```

## Error handling

- Missing `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` env vars: `serverClient.ts` throws
  a clear error at first use; the route catches it and returns `500` with a generic
  message (no internal details leaked to the client).
- Network/Supabase failure on insert: caught, logged server-side, `500` returned.
- Malformed/missing fields: `400` with per-field messages from zod's flattened error.

## Testing

- `lib/validation/enquiry.test.ts` (Vitest, already in scope per `vitest.config.ts`):
  valid payload passes; each required field missing fails; invalid email format fails;
  invalid phone format fails; `candidates_count` must be a positive integer when present.
- No component/e2e testing framework is configured in this scaffold, so section
  components are not unit-tested — this matches the existing project setup and is
  consistent with YAGNI for an assignment-scoped project.

## Manual steps (user-owned, outside this codebase's automation)

- Create a Supabase project, run `supabase/schema.sql` against it, and populate
  `.env.local` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (see
  `.env.example`). Confirmed with user: they will do this step themselves.

## Out of scope (explicit)

- Real Supabase project provisioning/migration tooling.
- Auth, admin dashboard for viewing leads, email notifications.
- Stock photography, external icon packs, analytics/tracking scripts.
- Pixel-perfect visual match to enterprise.accredian.com.

## Amendment (2026-08-09): backend moved to user-owned scope

After this spec was approved, the user decided to implement the backend
themselves rather than have it built as part of this plan. This changes the
"Lead-capture form" and "Manual steps" sections above as follows:

- **Dropped from this plan's scope:** `lib/validation/enquiry.ts` (Zod
  schema), `lib/supabase/serverClient.ts`, `app/api/enquire/route.ts`, and
  `supabase/schema.sql`. The user will design and implement all four
  themselves, in whatever shape they choose — the field list below is a
  reference, not a contract this plan enforces.
- **Still in this plan's scope:** the `EnquiryModal` UI — all form fields,
  basic client-side validation via native HTML attributes (`required`,
  `type="email"`, `pattern`, `min`), and a submit handler that is a clearly
  marked placeholder (no `fetch` call, no Zod dependency). It simulates a
  success state locally so the UI is demonstrably complete, with a code
  comment marking exactly where a real `POST /api/enquire` call would go.
- The form's field set is unchanged: Name, Email, Phone, Company, Domain
  (select), Number of candidates, Delivery mode (select), Location.
- "Manual steps" (previously just running `supabase/schema.sql`) now
  additionally includes building the entire backend: the Zod schema, the
  Supabase server client, the API route, and the SQL schema.

## Second amendment (2026-08-09): backend built after all

The user reversed the above decision the same day and asked for the full
backend to be built after all. `lib/validation/enquiry.ts` (+ Vitest
coverage), `lib/supabase/serverClient.ts`, `app/api/enquire/route.ts`, and
`supabase/schema.sql` were all added, and `EnquiryModal.tsx`'s submit
handler now calls the real endpoint with client + server Zod validation and
inline field-error display. The only manual step left for the user is
account-specific and cannot be done on their behalf: creating their own
Supabase project and populating `.env.local` with its URL and service-role
key.
