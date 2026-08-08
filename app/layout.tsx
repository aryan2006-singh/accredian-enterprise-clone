import type { Metadata } from 'next';
import './globals.css';
import { EnquiryModalProvider } from '@/components/EnquiryModalProvider';

export const metadata: Metadata = {
  title: 'Ascentra | Enterprise Learning Programs',
  description:
    'A partial clone of the Accredian Enterprise landing page, rebuilt with Next.js as a Full Stack Developer Intern assignment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <EnquiryModalProvider>{children}</EnquiryModalProvider>
      </body>
    </html>
  );
}
