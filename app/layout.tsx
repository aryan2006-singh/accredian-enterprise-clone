import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ascentra | Enterprise Learning Programs',
  description:
    'A partial clone of the Accredian Enterprise landing page, rebuilt with Next.js as a Full Stack Developer Intern assignment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
