'use client';

import { useState } from 'react';
import { faqCategories } from '@/lib/content/faqs';

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].category);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const current = faqCategories.find((c) => c.category === activeCategory) ?? faqCategories[0];

  function selectCategory(category: string) {
    setActiveCategory(category);
    setOpenQuestion(null);
  }

  return (
    <section id="faqs" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Frequently Asked Questions</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Everything You Need to Know</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="flex gap-2 overflow-x-auto md:flex-col">
          {faqCategories.map((category) => (
            <button
              key={category.category}
              type="button"
              onClick={() => selectCategory(category.category)}
              className={`whitespace-nowrap rounded-lg border px-4 py-2 text-left text-sm font-medium ${
                category.category === activeCategory
                  ? 'border-brand-600 text-brand-700'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {current.items.map((item) => {
            const isOpen = openQuestion === item.question;
            return (
              <div key={item.question} className="rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-900"
                >
                  {item.question}
                  <span className="ml-4 text-slate-400">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p className="px-4 pb-4 text-sm text-slate-600">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
