import { ReactNode } from 'react';

export function IconCircle({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
      {children}
    </div>
  );
}
