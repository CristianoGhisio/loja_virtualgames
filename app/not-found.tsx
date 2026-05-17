import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center px-4 py-20 max-w-lg">
        <h1 className="text-7xl sm:text-9xl font-bold text-neon-blue/20 mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          A página que você procura não existe ou foi movida. Mas não se preocupe — sua assistência técnica gamer continua pronta para te atender.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-neon-blue hover:bg-neon-blue-dark text-black font-bold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Voltar ao Início
          </Link>
          <a
            href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
