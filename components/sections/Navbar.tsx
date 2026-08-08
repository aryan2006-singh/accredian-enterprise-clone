'use client';

import { navLinks } from '@/lib/content/nav';
import { useEnquiryModal } from '@/components/EnquiryModalProvider';

export default function Navbar() {
  const { open } = useEnquiryModal();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#home" className="text-xl font-extrabold text-brand-600">
          Ascentra
        </a>
        <ul className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-brand-600">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={open}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Enquire Now
        </button>
      </nav>
    </header>
  );
}
