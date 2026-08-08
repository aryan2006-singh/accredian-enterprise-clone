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
