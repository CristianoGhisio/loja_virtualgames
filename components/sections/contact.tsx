'use client';

import { MessageCircle, MapPin, Clock, Phone } from 'lucide-react';

type StoreContactSettings = {
  address?: string | null;
  phone?: string | null;
  serviceHours?: string | null;
};

export function Contact({ settings }: { settings?: StoreContactSettings | null }) {
  const whatsappNumber = settings?.phone?.replace(/\D/g, '') || '5555997252786';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de falar com a equipe da Virtual Games.`;

  return (
    <section id="contato" className="py-16 sm:py-20 lg:py-24 bg-background-secondary/50 border-b border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-neon-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-neon-blue/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            FALE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">CONOSCO</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Tem alguma dúvida sobre serviços, orçamentos ou nossos campeonatos? Entre em contato agora mesmo!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl space-y-6 sm:space-y-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Informações da Loja</h3>
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 sm:p-3 bg-neon-blue/10 rounded-xl shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-neon-blue" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1 text-sm sm:text-base">Endereço</h4>
                  <p className="text-gray-400 text-sm whitespace-pre-line">
                    {settings?.address?.split(' - CEP').join('\nCEP')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 sm:p-3 bg-neon-blue/10 rounded-xl shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-neon-blue" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1 text-sm sm:text-base">Horário de Atendimento</h4>
                  <p className="text-gray-400 text-sm whitespace-pre-line">
                    {settings?.serviceHours?.split(' | ').join('\n')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 sm:p-3 bg-neon-blue/10 rounded-xl shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-neon-blue" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1 text-sm sm:text-base">Telefone</h4>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:text-white transition-colors text-sm">
                    {settings?.phone || '(55) 99725-2786'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-[#25D366]/10 to-transparent border border-[#25D366]/20 rounded-2xl sm:rounded-3xl text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#25D366] rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-[0_0_30px_rgba(37,211,102,0.3)]">
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Atendimento Rápido</h3>
            <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
              Clique no botão abaixo para falar diretamente com nossa equipe via WhatsApp.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 px-6 sm:px-8 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#25D366]/25"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">ABRIR WHATSAPP</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
