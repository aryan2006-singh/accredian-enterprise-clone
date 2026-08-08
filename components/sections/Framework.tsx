import { frameworkSteps } from '@/lib/content/framework';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { IconCircle } from '@/components/ui/IconCircle';

export default function Framework() {
  return (
    <section id="framework" className="bg-slate-50 py-16">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="Our Framework" title="How We Deliver Results That Matter" />
        <div className="grid gap-8 sm:grid-cols-3">
          {frameworkSteps.map((step) => (
            <div key={step.step} className="flex flex-col items-center text-center">
              <IconCircle>
                <span className="text-lg font-bold">{step.step}</span>
              </IconCircle>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
