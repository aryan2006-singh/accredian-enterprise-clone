# Ascentra Enterprise Landing Page

A partial clone of the Accredian Enterprise landing page, rebuilt with Next.js as a
Full Stack Developer Intern assignment. Original copy, original "Ascentra" branding,
fictional partners/testimonials — not affiliated with Accredian.

**Repository:** https://github.com/aryan2006-singh/accredian-enterprise-clone
**Live demo:** _add your Render URL here after deploying_

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

A `render.yaml` Blueprint is committed at the repo root, so Render can configure
the service automatically:

1. On the [Render dashboard](https://dashboard.render.com/), choose
   **New → Blueprint** and connect this GitHub repository
   (`aryan2006-singh/accredian-enterprise-clone`).
2. Render reads `render.yaml` and proposes a Web Service named
   `accredian-enterprise-clone` (Node runtime, `npm ci && npm run build` as the
   build command, `npm run start` to run it, free plan).
3. It will prompt for the two secrets the blueprint declares but doesn't set
   (`sync: false`): fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from
   your Supabase project's Settings → API.
4. Click **Apply**. First deploy takes a few minutes; Render assigns a
   `https://<service-name>.onrender.com` URL and redeploys automatically on
   every push to the connected branch.
5. Update the "Live demo" link above with that URL once it's live.

If you'd rather not use the Blueprint, create a Web Service manually with the
same build/start commands and environment variables — `render.yaml` is just a
convenience, not a requirement.

**Note:** the free Render plan spins the service down after periods of
inactivity, so the first request after a while may take ~30–60s to wake it
back up.
