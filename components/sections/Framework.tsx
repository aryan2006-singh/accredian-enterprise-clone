import { frameworkSteps } from '@/lib/content/framework';

export default function Framework() {
  return (
    <section id="framework" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our Framework</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">How We Deliver Results That Matter</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {frameworkSteps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {step.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
