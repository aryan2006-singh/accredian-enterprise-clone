import { testimonials } from '@/lib/content/testimonials';

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">What Partner Teams Are Saying</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Illustrative testimonials for this demo project.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.attribution} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">&ldquo;{testimonial.quote}&rdquo;</p>
              <cite className="mt-4 block text-sm font-semibold not-italic text-slate-900">
                {testimonial.attribution}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
