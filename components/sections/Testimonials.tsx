import { testimonials } from '@/lib/content/testimonials';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-slate-50 py-16">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Partner Teams Are Saying"
          subtitle="Illustrative testimonials for this demo project."
        />
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
      </Container>
    </section>
  );
}
