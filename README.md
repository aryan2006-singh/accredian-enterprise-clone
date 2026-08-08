# Ascentra Enterprise Landing Page

A partial clone of the Accredian Enterprise landing page, rebuilt with Next.js as a
Full Stack Developer Intern assignment. Original copy, original "Ascentra" branding,
fictional partners/testimonials — not affiliated with Accredian.

## Setup

```bash
npm install
cp .env.example .env.local
```

Then fill in `.env.local` with your own Supabase project's credentials:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — your project's service-role key (Project
  Settings → API). Server-side only — never exposed to the browser.

Run `supabase/schema.sql` once against your Supabase project (SQL Editor,
or `supabase db execute -f supabase/schema.sql`) to create the `enquiries`
table before submitting the "Enquire Now" form.

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

## How the lead form works

`EnquiryModal.tsx` validates input client-side with the same Zod schema the
server uses, `POST`s to `/api/enquire`, which re-validates and inserts into
Supabase via the service-role client. Validation errors (400) are shown
inline per field; server/network errors show a generic retry message and
keep the user's entered values.
