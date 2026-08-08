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
