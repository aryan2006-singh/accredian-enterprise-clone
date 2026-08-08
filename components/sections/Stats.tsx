import { stats } from '@/lib/content/stats';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';

export default function Stats() {
  return (
    <section id="stats" className="py-16">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="Our Track Record" title="The Numbers Behind Our Programs" />
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold text-brand-600">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
