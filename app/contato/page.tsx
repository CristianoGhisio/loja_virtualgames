import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SchemaOrg } from "@/components/seo/SchemaOrg";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Fale com a Virtual Games — Santa Maria, RS",
  description: "Entre em contato com a Virtual Games em Santa Maria. Endereço, telefone, WhatsApp e horário de funcionamento. Orçamento em 24h!",
  alternates: { canonical: `${siteUrl}/contato` },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPoint",
  telephone: "+55-55-99725-2786",
  contactType: "customer service",
  availableLanguage: "Portuguese",
  areaServed: "BR",
};

export default function ContatoPage() {
  return (
    <>
      <SchemaOrg schema={contactSchema} />
      <main id="main-content" className="min-h-screen text-foreground">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Contato" }]} />

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Fale com a Virtual Games — Santa Maria, RS
          </h1>

          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Informações de Contato</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Endereço</p>
                  <p className="text-white">Rua Venâncio Aires, 1434<br />Torre Divindade, Sala 106 D-2<br />Centro, Santa Maria, RS<br />CEP 97010-002</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">WhatsApp / Telefone</p>
                  <a href="https://wa.me/55997252786" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:text-neon-blue-dark transition-colors">(55) 99725-2786</a>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">E-mail</p>
                  <a href="mailto:contato@virtualgames.com" className="text-neon-blue hover:text-neon-blue-dark transition-colors">contato@virtualgames.com</a>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Horário de Funcionamento</p>
                  <p className="text-white">Segunda a Sexta: 09h às 18h30<br />Sábado: 09h às 13h</p>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
                  SOLICITAR ORÇAMENTO
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Como Chegar</h2>
              <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3466.072442539379!2d-53.8091!3d-29.6881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDQxJzE3LjIiUyA1M8KwNDgnMzIuOCJX!5e0!3m2!1spt-BR!2sbr!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da Virtual Games em Santa Maria"
                />
              </div>
              <p className="text-gray-400 text-xs mt-3">
                <a href="https://maps.google.com/?q=Rua+Venâncio+Aires+1434+Santa+Maria+RS" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">
                  Abrir no Google Maps →
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
