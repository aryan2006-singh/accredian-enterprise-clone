import { edgeHighlights } from '@/lib/content/edge';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';

export default function EdgeHighlights() {
  return (
    <section className="py-16">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="The Ascentra Edge" title="Key Aspects of Our Strategic Training" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {edgeHighlights.map((item) => (
            <Card key={item.title}>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
