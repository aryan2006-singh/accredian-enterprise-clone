'use client';

import { useEnquiryModal } from '@/components/EnquiryModalProvider';

export default function CtaBanner() {
  const { open } = useEnquiryModal();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand-600 px-6 py-10 text-center text-white sm:flex-row sm:px-10 sm:text-left">
        <div>
          <h2 className="text-2xl font-bold">Want to Learn More About Our Training Solutions?</h2>
          <p className="mt-2 text-brand-100">Get expert guidance for your team’s success.</p>
        </div>
        <button
          type="button"
          onClick={open}
          className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Enquire Now
        </button>
      </div>
    </section>
  );
}
