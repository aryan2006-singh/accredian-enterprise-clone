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
