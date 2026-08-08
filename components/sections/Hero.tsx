'use client';

import { hero } from '@/lib/content/hero';
import { useEnquiryModal } from '@/components/EnquiryModalProvider';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function Hero() {
  const { open } = useEnquiryModal();

  return (
    <section id="home" className="relative overflow-hidden bg-brand-50">
      <Container className="grid gap-10 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            {hero.headlineLead} <span className="text-brand-600">{hero.headlineHighlight}</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-slate-600">{hero.subheadline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {hero.highlights.map((item) => (
              <Badge key={item} label={item} />
            ))}
          </div>
          <Button onClick={open} className="mt-8">
            Enquire Now
          </Button>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div className="absolute inset-4 rounded-full bg-brand-100" />
          <div className="absolute inset-12 rounded-full bg-brand-200" />
          <div className="absolute inset-20 flex items-center justify-center rounded-full bg-brand-600 text-5xl font-extrabold text-white">
            A
          </div>
        </div>
      </Container>
    </section>
  );
}
