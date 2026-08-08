import { segmentation } from '@/lib/content/segmentation';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';

export default function CourseSegmentation() {
  return (
    <section className="py-16">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="Tailored Course Segmentation" title="Explore Custom-Fit Courses for Every Focus" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {segmentation.map((card) => (
            <Card key={card.title} className="text-center">
              <h3 className="text-lg font-semibold text-brand-700">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.tags.join(', ')}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
