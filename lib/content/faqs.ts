export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  category: string;
  items: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    category: 'About the Program',
    items: [
      {
        question: 'What types of corporate training programs does Ascentra offer?',
        answer:
          'Certificate, executive, and postgraduate-certificate programs across product, data, leadership, and technology domains.',
      },
      {
        question: 'Can programs be customized for our organization?',
        answer: 'Yes — every engagement starts with a skill-gap assessment and a tailored curriculum.',
      },
    ],
  },
  {
    category: 'About Delivery',
    items: [
      {
        question: 'What delivery formats are available?',
        answer: "Online, in-person, and hybrid formats, scheduled around your team's availability.",
      },
      {
        question: 'How long do programs typically run?',
        answer: 'Most engagements run 4–12 weeks, depending on scope and cohort size.',
      },
    ],
  },
  {
    category: 'Miscellaneous',
    items: [
      {
        question: 'How do we get started?',
        answer: 'Submit an enquiry through the form on this page and our team will follow up within two business days.',
      },
      {
        question: 'Is a minimum cohort size required?',
        answer: 'Most programs are designed for cohorts of 10 or more; smaller groups can be discussed on request.',
      },
    ],
  },
];
