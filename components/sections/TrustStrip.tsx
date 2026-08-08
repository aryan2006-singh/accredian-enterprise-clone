import { partners } from '@/lib/content/partners';

export default function TrustStrip() {
  return (
    <section id="partners" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our Partners</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Illustrative Enterprise Partners</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((partner) => (
            <span key={partner} className="text-lg font-semibold text-slate-500">
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
