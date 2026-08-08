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
