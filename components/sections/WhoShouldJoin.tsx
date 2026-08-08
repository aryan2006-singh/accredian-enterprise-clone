import { audiences } from '@/lib/content/audiences';

export default function WhoShouldJoin() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-3xl bg-brand-600 px-6 py-12 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-100">Who Should Join?</p>
        <h2 className="mt-2 max-w-lg text-3xl font-bold">Strategic Skill Enhancement</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {audiences.map((audience) => (
            <div key={audience.title}>
              <h3 className="text-lg font-semibold">{audience.title}</h3>
              <p className="mt-1 text-sm text-brand-100">{audience.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
