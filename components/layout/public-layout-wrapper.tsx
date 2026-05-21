'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isInternalPage = pathname.startsWith('/login') || pathname.startsWith('/dashboard');

  if (isInternalPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
