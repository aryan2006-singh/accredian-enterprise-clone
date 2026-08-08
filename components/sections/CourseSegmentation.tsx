import { segmentation } from '@/lib/content/segmentation';

export default function CourseSegmentation() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Tailored Course Segmentation</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Explore Custom-Fit Courses for Every Focus</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {segmentation.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-brand-700">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.tags.join(', ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
