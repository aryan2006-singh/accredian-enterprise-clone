import { footer } from '@/lib/content/footer';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div>
            <p className="text-xl font-extrabold text-brand-600">{footer.brand}</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">{footer.tagline}</p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-sm font-semibold text-slate-900">Quick Links</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                {footer.quickLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-brand-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Contact</p>
              <p className="mt-3 text-sm text-slate-500">{footer.contactEmail}</p>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-500">{footer.disclaimer}</p>
      </div>
    </footer>
  );
}
