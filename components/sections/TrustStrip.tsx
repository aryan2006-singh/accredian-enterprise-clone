import { partners } from '@/lib/content/partners';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function TrustStrip() {
  return (
    <section id="partners" className="bg-slate-50 py-16">
      <Container className="flex flex-col items-center gap-8">
        <SectionHeading eyebrow="Our Partners" title="Illustrative Enterprise Partners" />
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((partner) => (
            <span key={partner} className="text-lg font-semibold text-slate-500">
              {partner}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
