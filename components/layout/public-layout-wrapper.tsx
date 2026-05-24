'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const BG_OVERLAY_OPACITY = 0.70;

function BackgroundLayer() {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ backgroundImage: 'url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(10,10,15,${BG_OVERLAY_OPACITY})` }}
      />
    </div>
  );
}

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname.startsWith('/login');

  if (isDashboard) {
    return <>{children}</>;
  }

  if (isLogin) {
    return (
      <>
        <BackgroundLayer />
        {children}
      </>
    );
  }

  return (
    <>
      <BackgroundLayer />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
