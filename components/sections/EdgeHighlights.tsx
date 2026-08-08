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
