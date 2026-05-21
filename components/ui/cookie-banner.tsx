'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (!visible) {
      loadGtag();
    }
  }, [visible]);

  const acceptAll = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
    loadGtag();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="fixed bottom-0 left-0 right-0 z-[var(--z-modal)] animate-[fadeIn_0.4s_ease]"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-4 sm:pb-6">
        <div className="bg-[rgba(10,10,15,0.97)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 sm:p-6 shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-start gap-3 flex-1">
              <div className="shrink-0 mt-0.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
                </div>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed">
                <p className="text-white font-bold mb-1 text-base sm:text-lg">
                  Privacidade e Cookies
                </p>
                <p>
                  Utilizamos cookies essenciais para o funcionamento do site e, com sua permissão, cookies de análise (Google Analytics) para melhorar sua experiência. Consulte nossa{' '}
                  <Link href="/privacidade" className="text-neon-blue hover:text-neon-blue-dark underline underline-offset-2 transition-colors">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>
            <button
              onClick={acceptAll}
              className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neon-blue hover:bg-neon-blue-dark text-black font-bold px-6 py-3 rounded-xl text-sm transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,212,255,0.3)] active:scale-[0.98] cursor-pointer"
            >
              <X className="w-4 h-4" />
              Aceitar todos os cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function loadGtag() {
  if (typeof window === 'undefined') return;
  if (document.querySelector('script[src*="googletagmanager"]')) return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script.async = true;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(inlineScript);
}
