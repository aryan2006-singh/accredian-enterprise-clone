import { programs } from '@/lib/content/programs';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';

export default function DomainExpertise() {
  return (
    <section id="programs" className="bg-slate-50 py-16">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="Our Domain Expertise" title="Specialized Programs Designed to Fuel Innovation" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.title}>
              <h3 className="text-lg font-semibold text-slate-900">{program.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{program.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
