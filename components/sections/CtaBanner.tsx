'use client';

import { useEnquiryModal } from '@/components/EnquiryModalProvider';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function CtaBanner() {
  const { open } = useEnquiryModal();

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand-600 px-6 py-10 text-center text-white sm:flex-row sm:px-10 sm:text-left">
          <div>
            <h2 className="text-2xl font-bold">Want to Learn More About Our Training Solutions?</h2>
            <p className="mt-2 text-brand-50">Get expert guidance for your team’s success.</p>
          </div>
          <Button variant="secondary" onClick={open} className="shrink-0">
            Enquire Now
          </Button>
        </div>
      </Container>
    </section>
  );
}
