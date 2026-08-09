# Ascentra Enterprise Landing Page

A partial clone of the Accredian Enterprise landing page, rebuilt with Next.js as a
Full Stack Developer Intern assignment. Original copy, original "Ascentra" branding,
fictional partners/testimonials — not affiliated with Accredian.

**Repository:** https://github.com/aryan2006-singh/accredian-enterprise-clone
**Live demo:** https://accredian-enterprise-clone-cwz0.onrender.com

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
- `components/ui/` — shared presentational primitives (`Container`, `SectionHeading`, `Card`,
  `Badge`, `Button`, `IconCircle`) reused across section components instead of duplicating markup
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

## Deploying to Render

Already deployed at https://accredian-enterprise-clone-cwz0.onrender.com (Web
Service `srv-d9rrf449v7es73cu2rjg`, Node runtime, auto-deploys on every push
to `main`). It's running without Supabase
credentials right now, so `/api/enquire` correctly validates input and then
fails gracefully (500, "Something went wrong...") instead of persisting —
the same behavior as running locally with no `.env.local`. To make the lead
form actually save submissions:

1. Create a Supabase project and run `supabase/schema.sql` against it (see
   "Setup" above).
2. On the [Render dashboard](https://dashboard.render.com/) → this service →
   **Environment**, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from
   your Supabase project's Settings → API.
3. Render redeploys automatically when env vars change.

A `render.yaml` Blueprint is also committed at the repo root — useful if you
ever want to spin up a fresh service (**New → Blueprint**, connect this repo,
it reads the file and prompts for the same two secrets), but isn't required
for the existing service above, which was created directly.

**Note:** the free Render plan spins the service down after periods of
inactivity, so the first request after a while may take ~30–60s to wake it
back up.
