import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authorData = {
  name: 'Equipe Virtual Games',
  slug: 'equipe-virtual-games',
  role: 'Equipe Técnica e Conteúdo',
  bio: 'Equipe da Virtual Games, assistência técnica especializada em consoles e PC Gamer em Santa Maria, RS. Gamers de coração e profissionais por excelência.',
};

function makeSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeBody(paragraphs: string[]): Record<string, unknown>[] {
  return paragraphs.map((text) => ({
    type: 'paragraph',
    children: [{ text }],
  }));
}

function faqBody(faqs: { q: string; a: string }[]): Record<string, unknown>[] {
  return faqs;
}

interface PostInput {
  title: string;
  categoria: string;
  excerpt: string;
  paragraphs: string[];
  faqs?: { q: string; a: string }[];
  readingTime: number;
  relatedService?: string;
}

const POSTS: PostInput[] = [
  // ==================== COMPARATIVOS ====================
  {
    title: 'PS5 Slim vs PS5 Pro: Vale a pena pagar mais pelo modelo Pro?',
    categoria: 'Comparativos',
    excerpt: 'Comparamos o PS5 Slim e o PS5 Pro em desempenho, preço e recursos para ajudar você a decidir qual console comprar em 2025.',
    paragraphs: [
      'Desde o lançamento do PlayStation 5 Pro, muitos gamers ficaram na dúvida: vale a pena investir a mais no modelo Pro ou o PS5 Slim já atende bem? Neste comparativo, analisamos as principais diferenças entre os dois consoles para ajudar na sua decisão.',
      'O PS5 Slim é a versão mais compacta e acessível do console da Sony. Com 825 GB de armazenamento interno (cerca de 667 GB utilizáveis), ele é capaz de rodar jogos em 4K a 60 fps na maioria dos títulos, com suporte a ray tracing e tempos de carregamento ultrarrápidos graças ao SSD personalizado.',
      'O PS5 Pro, por sua vez, traz um salto significativo de performance. Com 28 TFLOPS de poder gráfico (contra os 10,3 TFLOPS do Slim), ele utiliza a tecnologia PSSR (PlayStation Spectral Super Resolution) para alcançar resoluções superiores. O resultado é um verdadeiro 4K a 60 fps com ray tracing ativado na maioria dos jogos, podendo chegar a 120 fps em títulos competitivos.',
      'Em termos de armazenamento, o PS5 Pro vem com 2 TB de SSD, praticamente o dobro do Slim. Isso significa mais jogos instalados sem precisar ficar gerenciando espaço. Ambos os consoles permitem expansão via SSD NVMe M.2.',
      'A diferença de preço é significativa: enquanto o PS5 Slim pode ser encontrado a partir de R$ 3.500, o PS5 Pro chega ao mercado por volta de R$ 5.500 a R$ 6.000. A pergunta é: a diferença de performance justifica o investimento?',
      'Para gamers que têm uma TV 4K com taxas de atualização altas (120 Hz ou mais) e querem a melhor experiência visual possível em cada jogo, o PS5 Pro é a escolha certa. Jogos como Spider-Man 2, Final Fantasy VII Rebirth e Gran Turismo 7 rodam visivelmente melhores no Pro.',
      'Por outro lado, se você joga em um monitor Full HD ou 4K padrão (60 Hz) e não se importa em abrir mão de alguns detalhes gráficos, o PS5 Slim entrega uma experiência excelente por um valor mais acessível. A diferença visual em uma TV comum é menos perceptível do que nos vídeos de comparação.',
      'Conclusão: o PS5 Pro é para os entusiastas que querem o melhor da Sony. O PS5 Slim é a escolha inteligente para quem busca um console de altíssima qualidade sem gastar uma fortuna.',
    ],
    faqs: [
      { q: 'O PS5 Pro roda jogos em 8K?', a: 'O PS5 Pro tem suporte teórico para 8K, mas na prática pouquíssimos jogos alcançarão essa resolução. O foco principal é o 4K com altas taxas de quadros e ray tracing de qualidade.' },
      { q: 'Vale a pena trocar o PS5 Slim pelo Pro?', a: 'Se você já tem um PS5 Slim e está satisfeito, a troca não é essencial. O Pro faz diferença principalmente para quem tem TVs de alta qualidade e busca o máximo desempenho.' },
      { q: 'Os jogos do PS5 Slim funcionam no Pro?', a: 'Sim, todos os jogos de PS5 e PS4 são compatíveis com o PS5 Pro. Muitos recebem patches gratuitos de otimização para aproveitar o hardware extra.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Nintendo Switch 2 vs Steam Deck: Qual portátil escolher em 2025?',
    categoria: 'Comparativos',
    excerpt: 'O Nintendo Switch 2 e o Steam Deck OLED 2 dominam o mercado de portáteis. Comparamos specs, biblioteca de jogos e preço para ajudar na escolha.',
    paragraphs: [
      'O ano de 2025 trouxe dois gigantes no mercado de consoles portáteis: o Nintendo Switch 2 e o Steam Deck OLED 2. Ambos são excelentes, mas atendem a perfis de jogador muito diferentes. Vamos às comparações.',
      'O Nintendo Switch 2 chega com uma tela OLED de 8 polegadas com resolução 1080p e taxa de atualização de 120 Hz. Seu grande trunfo é o formato híbrido: funciona como portátil e como console de mesa. O catálogo inclui os exclusivos da Nintendo como Mario Kart World, Zelda e Pokémon, além de total retrocompatibilidade com os jogos do Switch original.',
      'O Steam Deck OLED 2 é um PC portátil. Com tela OLED de 90 Hz, processador AMD Zen 4 com gráficos RDNA 3 e bateria de 8.000 mAh, ele roda praticamente qualquer jogo de PC da Steam, inclusive títulos AAA como Cyberpunk 2077 e Black Myth: Wukong em configurações médias a altas.',
      'Em termos de performance bruta, o Steam Deck OLED 2 leva vantagem. Ele é capaz de rodar jogos mais pesados e oferece acesso a bibliotecas de várias lojas (Steam, Epic, Game Pass). Porém, exige mais configurações e conhecimento técnico.',
      'O Switch 2 é mais simples e direto. Você liga e joga. A Nintendo cuida da experiência do usuário com uma interface intuitiva e jogos otimizados para o hardware. A bateria também dura mais até 8 horas contra 5 a 7 horas do Steam Deck.',
      'Quanto ao preço, o Switch 2 custa entre US$ 399 e US$ 449, enquanto o Steam Deck OLED 2 sai por US$ 599. No Brasil, a diferença é ainda maior devido à importação.',
      'Conclusão: se você quer jogar os exclusivos da Nintendo e prefere simplicidade, vá de Switch 2. Se quer um PC portátil para jogar sua biblioteca Steam onde quiser, o Steam Deck OLED 2 é imbatível.',
    ],
    faqs: [
      { q: 'O Steam Deck roda jogos do Switch?', a: 'Não oficialmente. É possível usar emuladores, mas a Nintendo combate ativamente essa prática e pode haver questões legais envolvidas.' },
      { q: 'Qual tem melhor bateria?', a: 'O Nintendo Switch 2 tem melhor autonomia de bateria, chegando a até 8 horas de jogo contra 5 a 7 horas do Steam Deck OLED 2.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Xbox Series S vs Xbox Series X: Qual console da Microsoft escolher?',
    categoria: 'Comparativos',
    excerpt: 'Entenda as diferenças entre Xbox Series S e Series X em desempenho, armazenamento, preço e descubra qual é o melhor para você.',
    paragraphs: [
      'A Microsoft lançou duas versões do seu console de nona geração: o Xbox Series X, mais potente e caro, e o Xbox Series S, mais acessível e compacto. Ambos rodam os mesmos jogos, mas com diferenças importantes.',
      'O Xbox Series X é um console de alto desempenho com 12 TFLOPS de poder gráfico, 1 TB de armazenamento SSD e leitor de disco 4K. Ele é capaz de rodar jogos em 4K nativo a 60 fps, com suporte a ray tracing e taxas de até 120 fps em títulos otimizados.',
      'O Xbox Series S é totalmente digital e mais compacto. Com 4 TFLOPS, 512 GB ou 1 TB de SSD, ele foca em resolução 1440p (podendo chegar a 4K upscaling) e roda os mesmos jogos do Series X, mas com gráficos reduzidos e sem leitor de disco.',
      'Na prática, a diferença é clara: o Series X entrega a experiência completa em 4K, enquanto o Series S é uma porta de entrada acessível para o ecossistema Xbox e Game Pass. O Series S é ideal para quem tem TV Full HD ou 1440p e não se importa em abrir mão do disco físico.',
      'Com a recente atualização do Series S com 2 TB de armazenamento, a Microsoft oferece ainda mais opções para diferentes orçamentos.',
      'Ambos os consoles têm acesso ao Game Pass Ultimate, que dá centenas de jogos por uma assinatura mensal, incluindo lançamentos day one da Microsoft e da Activision Blizzard.',
      'Conclusão: escolha o Series X se você tem uma TV 4K e quer a máxima performance. Escolha o Series S se quer entrar no ecossistema Xbox gastando menos.',
    ],
    faqs: [
      { q: 'O Xbox Series S roda todos os jogos do Series X?', a: 'Sim, roda todos os mesmos jogos, porém em resolução mais baixa (1440p em vez de 4K) e sem leitor de disco.' },
      { q: 'Vale a pena comprar o Series S em 2025?', a: 'Sim, especialmente para quem assina Game Pass e não joga em TV 4K. É o console de maior custo-benefício da atual geração.' },
    ],
    readingTime: 5,
  },
  {
    title: 'PS5 vs Xbox Series X: Qual console comprar em 2025?',
    categoria: 'Comparativos',
    excerpt: 'Comparação definitiva entre PlayStation 5 e Xbox Series X: jogos exclusivos, performance, serviços de assinatura e preço.',
    paragraphs: [
      'A rivalidade entre PlayStation e Xbox continua mais acirrada do que nunca em 2025. Ambos os consoles são extremamente competentes, mas cada um tem seus pontos fortes que atendem a diferentes perfis de jogador.',
      'O PS5 Slim e o PS5 Pro oferecem jogos exclusivos aclamados como Spider-Man 2, God of War Ragnarok, Final Fantasy VII Rebirth e The Last of Us. O controle DualSense é um diferencial imersivo, com gatilhos adaptáveis e resposta háptica que poucos jogos no Xbox aproveitam.',
      'O Xbox Series X se destaca pelo Game Pass Ultimate, que oferece centenas de jogos por um valor mensal, incluindo lançamentos day one de todos os estúdios da Microsoft e Activision Blizzard. O Quick Resume permite alternar entre vários jogos instantaneamente.',
      'Em performance bruta, o Xbox Series X tem ligeira vantagem em poder computacional (12 TFLOPS contra 10,3 TFLOPS do PS5 Slim), mas na prática a diferença é imperceptível na maioria dos jogos. O PS5 Pro, porém, supera ambos com seus 28 TFLOPS e tecnologia PSSR.',
      'O ecossistema de cada um também pesa na decisão. A Sony investe em exclusivos cinematográficos single-player. A Microsoft foca em serviço e multiplataforma, com todos os jogos saindo também para PC.',
      'Em termos de preço, o PS5 Slim e o Xbox Series X estão em patamares similares. O Xbox Series S é a opção mais barata do mercado.',
      'Conclusão: se você valoriza jogos exclusivos single-player de alta qualidade, escolha PlayStation. Se prefere uma biblioteca enorme por assinatura e joga em várias plataformas, Xbox é a melhor escolha.',
    ],
    faqs: [
      { q: 'Qual console é mais potente?', a: 'O Xbox Series X tem mais poder bruto (12 TFLOPS), mas o PS5 Pro (28 TFLOPS) é o console mais potente disponível atualmente.' },
      { q: 'Vale a pena ter os dois consoles?', a: 'Sim, muitos gamers optam por ter ambos para aproveitar os exclusivos de cada plataforma e escolher onde comprar jogos multiplataforma.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Controle Original vs Controle Genérico: Qual comprar?',
    categoria: 'Comparativos',
    excerpt: 'Comparamos controles originais de PS5, Xbox e Switch contra opções genéricas e de terceiros. Veja qual vale mais a pena.',
    paragraphs: [
      'Na hora de comprar um controle extra, surge a dúvida: investir em um controle original ou economizar com um modelo genérico ou de terceiros? A resposta depende do seu orçamento, plataforma e prioridades.',
      'Os controles originais DualSense do PS5, Xbox Wireless Controller e Joy-Con do Switch oferecem a melhor experiência. O DualSense tem gatilhos adaptáveis e resposta háptica que poucos controles terceirizados replicam. O controle do Xbox é o mais confortável para mãos grandes e tem compatibilidade nativa com PC.',
      'Os controles de terceiros de qualidade, como os da 8BitDo, Razer Wolverine e PowerA, oferecem boa construção e recursos extras como botões programáveis e paddles traseiros. Eles são ideais para jogadores competitivos que buscam vantagens extras.',
      'Já os controles genéricos de baixo custo podem ser tentadores pelo preço, mas é preciso ter cuidado. Muitos têm problemas de deadzone nos analógicos, conectividade instável, construção frágil e drift precoce. A economia inicial pode se transformar em dor de cabeça.',
      'Para uso casual, um controle de terceiros de marca confiável (como 8BitDo ou PowerA) é um bom meio-termo. Para jogadores que passam horas jogando e valorizam precisão, o original é sempre a melhor escolha.',
      'Importante: ao comprar controles originais, desconfie de preços muito abaixo da média. O mercado de controles falsificados é grande, e a qualidade é muito inferior.',
    ],
    faqs: [
      { q: 'Controle genérico estraga rápido?', a: 'Depende da marca. Controles de marcas como 8BitDo e PowerA têm boa durabilidade. Já os genéricos sem marca costumam apresentar drift e falhas em poucos meses.' },
      { q: 'Controle de Xbox funciona no PS5?', a: 'Não diretamente. É necessário um adaptador como Brook Wingman para usar controle de Xbox no PS5, mas sem suporte a recursos como gatilhos adaptáveis.' },
    ],
    readingTime: 5,
  },
  {
    title: 'PC Gamer vs Console: Qual plataforma escolher em 2025?',
    categoria: 'Comparativos',
    excerpt: 'Análise completa das vantagens e desvantagens de PC Gamer e consoles para ajudar na sua escolha.',
    paragraphs: [
      'A eterna dúvida dos gamers: montar um PC Gamer ou comprar um console? Em 2025, ambas as opções são excelentes, mas atendem a necessidades diferentes. Vamos analisar cada aspecto.',
      'Os consoles oferecem simplicidade: ligou, jogou. Não precisa se preocupar com configurações, drivers ou requisitos mínimos. O custo inicial é mais baixo (um PS5 Slim custa a partir de R$ 3.500) e você tem garantia de que todos os jogos rodarão bem por anos.',
      'O PC Gamer exige investimento inicial maior (um PC intermediário custa a partir de R$ 5.000), mas oferece vantagens como gráficos superiores, taxas de quadros mais altas, mods, upgrade de componentes e funcionalidades multitarefa. Jogos na Steam costumam ser mais baratos que nas lojas dos consoles.',
      'O Game Pass está disponível em ambas as plataformas, mas no PC você também tem acesso a serviços como Epic Games Store (com jogos grátis semanais), Steam e lojas de terceiros.',
      'Para quem joga casualmente e quer praticidade, o console é a melhor escolha. Para entusiastas que buscam máxima performance, personalização e não se importam em aprender sobre hardware, o PC Gamer é imbatível.',
      'Uma tendência de 2025 são os PCs portáteis como Steam Deck e ROG Ally, que combinam a versatilidade do PC com a portabilidade dos consoles. Eles representam um meio-termo interessante.',
    ],
    faqs: [
      { q: 'Qual dura mais: PC ou console?', a: 'Um PC pode durar mais tempo se você fizer upgrades periódicos. Um console tem vida útil de 6 a 7 anos sem necessidade de upgrade.' },
      { q: 'Jogar no PC é mais caro que no console?', a: 'O investimento inicial é maior, mas os jogos são significativamente mais baratos em promoções da Steam, o que pode compensar a diferença ao longo do tempo.' },
    ],
    readingTime: 6,
  },

  // ==================== CONSOLES ====================
  {
    title: 'Os consoles mais vendidos de todos os tempos',
    categoria: 'Consoles',
    excerpt: 'Ranking completo dos consoles mais vendidos da história, do PS2 ao Nintendo Switch 2.',
    paragraphs: [
      'Você sabe quais são os consoles mais vendidos de todos os tempos? Preparamos um ranking completo para matar a curiosidade e mostrar como o mercado de videogames evoluiu ao longo das décadas.',
      '1. PlayStation 2 com 155 milhões de unidades. Lançado em 2000, o PS2 reinou absoluto com seu vasto catálogo de jogos e função de DVD player. Até hoje é o console mais vendido da história.',
      '2. Nintendo DS com 154 milhões. O portátil de tela dupla da Nintendo conquistou públicos de todas as idades com jogos inovadores como Nintendogs e Brain Training.',
      '3. Nintendo Switch com 141 milhões (e contando). O console híbrido da Nintendo uniu o melhor dos dois mundos e se tornou o terceiro mais vendido da história.',
      '4. Game Boy / Game Boy Color com 118 milhões. O pioneiro dos portáteis modernos, que apresentou Pokémon ao mundo.',
      '5. PlayStation 4 com 117 milhões. O console mais vendido da geração anterior, com um catálogo forte de exclusivos.',
      '6. PlayStation 5 com 92 milhões (e crescendo). Mesmo com desafios de estoque, o PS5 já é o sexto console mais vendido da história.',
      '7. Nintendo Switch 2 com 20 milhões em apenas seis meses. O novo console da Nintendo teve o lançamento mais rápido da história dos videogames.',
      'O mercado de consoles continua forte e crescendo. Com o Switch 2 quebrando recordes de vendas e o PS5 ainda em alta, a história dos videogames está longe do fim.',
    ],
    faqs: [
      { q: 'O Xbox já apareceu no ranking de mais vendidos?', a: 'O console mais vendido da Microsoft é o Xbox 360, com 87 milhões de unidades, seguido pelo Xbox One com 58 milhões.' },
      { q: 'PS2 ainda é o mais vendido?', a: 'Sim, o PlayStation 2 mantém a liderança com 155 milhões de unidades vendidas, seguido de perto pelo Nintendo DS.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Guia completo: Como aumentar a vida útil do seu console',
    categoria: 'Consoles',
    excerpt: 'Dicas práticas de conservação para fazer seu PS5, Xbox ou Switch durar muitos anos.',
    paragraphs: [
      'Seu console é um investimento, e com alguns cuidados simples você pode prolongar significativamente a vida útil dele. Reunimos as melhores práticas de conservação para consoles.',
      '1. Posicionamento adequado: Nunca coloque o console em locais fechados ou com pouca ventilação. O superaquecimento é a principal causa de falhas em consoles modernos. Mantenha pelo menos 15 cm de espaço livre ao redor do aparelho.',
      '2. Limpeza preventiva regular: A poeira acumulada obstrui as saídas de ar e faz o console trabalhar mais quente. Recomendamos uma limpeza interna a cada 12 meses. Em ambientes com mais poeira, a cada 6 meses.',
      '3. Troca de pasta térmica: A pasta térmica entre o processador e o dissipador resseca com o tempo. Após 2 a 3 anos de uso, a troca pode reduzir a temperatura do console em até 15 graus.',
      '4. Cuidado com cabos: Evite puxar cabos pelo fio. Segure sempre pelo conector. A porta HDMI é um dos componentes mais frágeis e mais caros para consertar.',
      '5. Desligamento correto: Sempre desligue o console pelo menu e aguarde os ventiladores pararem antes de desconectar da tomada. Isso evita danos ao sistema de arquivos e componentes.',
      '6. Evite quedas de energia: Use um filtro de linha ou nobreak. Quedas de energia podem danificar a fonte e o disco rígido do console.',
      '7. Controle a umidade: Ambientes muito úmidos podem causar oxidação nos contatos da placa. Evite deixar o console em porões ou locais sujeitos a infiltrações.',
      'Seguindo essas dicas, seu console pode durar tranquilamente de 7 a 10 anos sem apresentar problemas graves.',
    ],
    faqs: [
      { q: 'Devo deixar o console ligado em modo descanso?', a: 'Sim, o modo descanso é seguro e permite atualizações automáticas. Mas uma vez por semana é bom desligar completamente.' },
      { q: 'Limpeza preventiva realmente faz diferença?', a: 'Sim, a limpeza preventiva é o cuidado mais importante para a longevidade do console. Poeira acumulada é a principal causa de superaquecimento.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Vale a pena comprar um console usado? Guia completo',
    categoria: 'Consoles',
    excerpt: 'Tudo o que você precisa verificar antes de comprar um console usado. Dicas para não cair em golpes.',
    paragraphs: [
      'Comprar um console usado pode ser uma excelente forma de economizar, mas é preciso ter atenção a vários detalhes para não ter dor de cabeça. Preparamos um guia completo.',
      'Antes de comprar, verifique o estado físico do console: carcaça sem trincas, entradas sem ferrugem, pés de borracha intactos. Consoles com sinais de queda podem ter danos internos imperceptíveis.',
      'Ligue o console e teste: leitor de disco (se houver), portas USB, entrada HDMI, Wi-Fi, Bluetooth (com um controle), saída de áudio. Verifique se o console não desliga sozinho após alguns minutos de uso.',
      'Peça para ver o funcionamento por pelo menos 20 minutos. Consoles com superaquecimento podem demorar alguns minutos para apresentar o problema.',
      'Verifique o controle: todos os botões, analógicos (inclusive testando drift), gatilhos e funções especiais como touchpad e giroscópio.',
      'Desconfie de preços muito baixos. Consoles com preço muito abaixo da média podem ter problemas ocultos. Consoles sem garantia do vendedor exigem ainda mais cautela.',
      'Na Virtual Games, oferecemos diagnóstico gratuito para consoles recém-adquiridos. Se você comprou um console usado e quer garantir que está tudo certo, traga para avaliarmos sem custo.',
    ],
    faqs: [
      { q: 'Qual a vida útil média de um console?', a: 'Com cuidados adequados, um console dura de 7 a 10 anos. Consoles bem conservados podem durar ainda mais.' },
      { q: 'Console usado tem risco de dar problema?', a: 'Sim, principalmente se não foi bem cuidado. Por isso a verificação prévia é essencial.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Como funciona o diagnóstico gratuito de consoles?',
    categoria: 'Consoles',
    excerpt: 'Entenda como fazemos o diagnóstico gratuito do seu console e por que você não paga nada para saber o que tem de errado.',
    paragraphs: [
      'Na Virtual Games, o diagnóstico de consoles é totalmente gratuito. Mas como funciona esse processo? Explicamos passo a passo.',
      'Quando você traz seu console até nossa loja em Santa Maria, nosso primeiro passo é ouvir você: qual o problema, quando começou, o que você já tentou fazer. Essas informações são valiosas para direcionar o diagnóstico.',
      'Em seguida, abrimos o console (quando necessário) e realizamos uma inspeção visual detalhada. Procuramos por sinais de oxidação, capacitores estufados, soldas rompidas e outros problemas visíveis.',
      'Com equipamentos especializados, testamos a parte elétrica: fonte, tensões, circuitos de alimentação. Para problemas de vídeo, testamos a porta HDMI e o chip de vídeo. Para superaquecimento, medimos temperaturas em funcionamento.',
      'Após a análise, apresentamos um relatório claro: qual é o problema, o que precisa ser feito para consertar, qual o valor do reparo e o prazo estimado. Tudo explicado em linguagem simples.',
      'O diagnóstico gratuito é nossa forma de mostrar transparência. Você só paga se autorizar o reparo. E mesmo que decida não consertar conosco, não cobramos nada pela avaliação.',
      'Essa é uma vantagem enorme em relação a muitas assistências que cobram pelo orçamento. Acreditamos que a confiança vem da transparência.',
    ],
    faqs: [
      { q: 'O diagnóstico gratuito inclui abertura do console?', a: 'Sim, abrimos o console para inspeção interna quando necessário, tudo sem custo.' },
      { q: 'Quanto tempo leva o diagnóstico?', a: 'A maioria dos diagnósticos é concluída em até 24h. Casos simples podem ser resolvidos em poucas horas.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Problemas comuns em consoles e como identificar',
    categoria: 'Consoles',
    excerpt: 'Guia para identificar os problemas mais frequentes em PS5, Xbox e Nintendo Switch antes de levar à assistência.',
    paragraphs: [
      'Conhecer os sinais de problemas no seu console pode ajudar a buscar o reparo certo mais rapidamente. Listamos os problemas mais comuns em cada plataforma.',
      'PS5: O problema mais frequente é a porta HDMI danificada, geralmente causada por puxar o cabo sem segurar o conector. Sintomas: tela preta ou imagem piscando. Outro problema comum é o superaquecimento, que causa desligamentos após 20 a 30 minutos de uso.',
      'Xbox Series X/S: Superaquecimento e disco que não lê (no Series X) estão entre os problemas mais relatados. O console pode desligar sozinho ou apresentar ruídos no cooler. A limpeza interna e troca de pasta térmica costumam resolver.',
      'Nintendo Switch: Drift nos Joy-Cons é o problema mais famoso. Os analógicos começam a registrar movimento sem comando. Também são comuns problemas de bateria que não carrega e tela quebrada.',
      'Em todos os consoles, os sinais de alerta incluem: ruídos anormais (cooler barulhento), superaquecimento, desligamentos aleatórios, lentidão na interface e artefatos gráficos.',
      'Ao notar qualquer desses sintomas, o ideal é buscar o diagnóstico o quanto antes. Problemas pequenos podem se agravar rapidamente se ignorados.',
    ],
    faqs: [
      { q: 'Console fazendo barulho é normal?', a: 'Barulho do cooler é normal, mas se estiver muito alto ou irregular, pode indicar acúmulo de poeira ou falha no rolamento do ventilador.' },
      { q: 'Desligamento aleatório indica problema grave?', a: 'Sim, desligamentos aleatórios geralmente indicam superaquecimento ou problema na fonte. Quanto antes diagnosticar, menor o risco de danos permanentes.' },
    ],
    readingTime: 6,
  },

  // ==================== CONTROLES E ACESSÓRIOS ====================
  {
    title: 'Como limpar e cuidar dos seus controles corretamente',
    categoria: 'Controles e Acessórios',
    excerpt: 'Guia prático de limpeza e conservação para controles de PS5, Xbox e Nintendo Switch.',
    paragraphs: [
      'Os controles são a parte do console que mais usamos e também a que mais sofre com desgaste. Com alguns cuidados simples, você pode prolongar significativamente a vida útil deles.',
      'A limpeza regular é essencial. Use um pano de microfibra levemente umedecido com álcool isopropílico (não use álcool comum, que pode danificar o acabamento) para limpar a superfície do controle. Evite que líquidos entrem pelas frestas.',
      'Os analógicos são a parte mais crítica. Com o tempo, o atrito pode desgastar o mecanismo interno, causando drift. Para prevenir, evite pressionar os analógicos com força excessiva e mantenha as mãos limpas ao jogar.',
      'A sujeira acumulada nos cantos do controle pode ser removida com um palito de dente ou ferramenta de plástico própria para eletrônicos. Nunca use objetos metálicos que possam arranhar.',
      'Para limpeza mais profunda, como troca de analógicos com drift, recomendamos procurar uma assistência especializada. A Virtual Games realiza esse serviço com peças de qualidade e garantia de 90 dias.',
      'Guarde os controles em local seco e arejado. Evite deixá-los expostos ao sol ou em locais úmidos. Se for guardar por muito tempo, remova as pilhas ou baterias.',
    ],
    faqs: [
      { q: 'Pode usar álcool 70 para limpar controle?', a: 'Não é recomendado. O álcool 70 tem água na composição, que pode infiltrar no controle. Prefira álcool isopropílico (90% ou superior).' },
      { q: 'Como evitar drift nos analógicos?', a: 'Evite pressionar os analógicos com força, não jogue com as mãos sujas e faça a manutenção preventiva anualmente.' },
    ],
    readingTime: 4,
  },
  {
    title: 'Melhores headsets gamers custo-benefício em 2025',
    categoria: 'Controles e Acessórios',
    excerpt: 'Seleção dos melhores headsets gamers com bom custo-benefício para todas as plataformas.',
    paragraphs: [
      'Um bom headset faz toda a diferença na imersão dos jogos e na comunicação com o time. Selecionamos os melhores headsets custo-benefício de 2025.',
      '1. HyperX Cloud Stinger 2: O clássico custo-benefício. Confortável, som equilibrado e microfone decente por um preço acessível. Funciona em PC, PS5, Xbox e Switch.',
      '2. Razer BlackShark V2 X: Leve (240g) e com bom isolamento de ruído. Os drivers de 50 mm entregam som com qualidade para jogos competitivos.',
      '3. Corsair HS55 Surround: Surround 7.1 virtual, construção leve e almofadas de espuma de memória. Ótimo para longas sessões de jogo.',
      '4. Logitech G435 Lightspeed: Headset sem fio acessível, pesa apenas 165g e tem bateria de 18 horas. Compatível com PC, PlayStation e Nintendo Switch.',
      '5. JBL Quantum 100: A opção mais barata da lista, mas com som surpreendentemente bom para o preço. Microfone com cancelamento de ruído.',
      'Na hora de escolher, considere: conforto (almofadas e peso), som (drivers maiores geralmente são melhores), microfone e compatibilidade com sua plataforma.',
    ],
    faqs: [
      { q: 'Headset sem fio tem latência?', a: 'Os modelos modernos têm latência imperceptível, principalmente os que usam conexão USB de 2,4 GHz em vez de Bluetooth.' },
      { q: 'Vale a pena investir em headset caro?', a: 'Depende do seu nível de exigência. Para uso casual, headsets de R$ 150 a R$ 300 já entregam boa qualidade.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Guia de compatibilidade de acessórios entre plataformas',
    categoria: 'Controles e Acessórios',
    excerpt: 'Saiba quais acessórios funcionam entre PS5, Xbox, Nintendo Switch e PC.',
    paragraphs: [
      'Comprar acessórios para múltiplas plataformas pode ser confuso. Organizamos um guia prático de compatibilidade para ajudar.',
      'Controles: O controle do Xbox funciona nativamente em PC e Xbox. No PS5, funciona apenas via adaptador. O DualSense do PS5 funciona no PC com fio ou Bluetooth, mas sem os recursos avançados de resposta háptica. O Pro Controller do Switch funciona no PC, mas não nos outros consoles.',
      'Headsets: Headsets com conexão USB ou P2 funcionam em todas as plataformas. Headsets Xbox Wireless funcionam apenas no Xbox e PC. Headsets PlayStation funcionam no PS5, PC e às vezes no Switch via P2.',
      'Volantes: A maioria dos volantes de marcas como Logitech e Thrustmaster tem compatibilidade multiplataforma, mas verifique o modelo específico.',
      'Teclado e mouse: Funcionam nativamente em PC e em alguns jogos de PS5 e Xbox. O Nintendo Switch tem suporte limitado via adaptador.',
      'Dica: acessórios com conexão USB padrão ou P2 tendem a ser mais universais. Para compatibilidade garantida, verifique a caixa do produto ou o site do fabricante.',
    ],
    faqs: [
      { q: 'Controle de PS5 funciona no Xbox?', a: 'Não diretamente. É necessário um adaptador específico como Brook Wingman, e mesmo assim com funcionalidades limitadas.' },
      { q: 'Headset de Xbox funciona no PS5?', a: 'Se for headset com conector P2 de 3,5 mm, sim. Headsets Xbox Wireless não funcionam no PS5.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Drift nos controles: O que é, causas e soluções definitivas',
    categoria: 'Controles e Acessórios',
    excerpt: 'Entenda de uma vez por todas o que causa o drift nos analógicos e como resolver definitivamente.',
    paragraphs: [
      'O drift é um dos problemas mais frustrantes para qualquer gamer. O personagem se move sozinho, a câmera gira sem comando e a precisão em jogos competitivos vai por água abaixo.',
      'O drift acontece quando o sensor do analógico registra movimento mesmo sem o jogador estar tocando no manípulo. Isso ocorre pelo desgaste natural do componente, que acumula partículas de poeira e perde a calibragem com o uso.',
      'Em controles de PS5 (DualSense), Xbox Series e Joy-Con do Switch, o drift é mais comum devido ao design compacto dos analógicos. O Joy-Con é particularmente suscetível por seu tamanho reduzido.',
      'Soluções caseiras como soprar ar comprimido ou usar álcool podem dar resultado temporário, mas não resolvem o problema de raiz. A única solução definitiva é a substituição do módulo analógico completo.',
      'Na Virtual Games, realizamos a troca dos analógicos com solda profissional e calibragem pós-reparo. O serviço inclui garantia de 90 dias: se o drift voltar nesse período, trocamos novamente sem custo.',
      'Após o reparo, o controle volta a funcionar como novo. Analógicos novos têm deadzone zerada e resposta precisa. Recomendamos trocar ambos os analógicos quando um apresenta drift, pois o outro também está com desgaste avançado.',
    ],
    faqs: [
      { q: 'Drift tem conserto definitivo?', a: 'Sim, a troca do módulo analógico com calibragem profissional resolve o drift de forma definitiva.' },
      { q: 'Quanto custa para consertar drift no PS5?', a: 'O reparo de drift no DualSense custa a partir de R$ 120 por analógico, com garantia de 90 dias. Diagnóstico gratuito.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Guia de controles: Qual modelo escolher para cada estilo de jogo',
    categoria: 'Controles e Acessórios',
    excerpt: 'Dos fight sticks aos volantes, saiba qual controle é ideal para cada gênero de jogo.',
    paragraphs: [
      'Nem todo controle é igual, e cada gênero de jogo pode se beneficiar de um tipo específico de controle. Veja nosso guia completo.',
      'Para jogos de luta: Fight sticks (arcade sticks) oferecem precisão superior para comandos especiais e combos. Se preferir controle padrão, opte por modelos com direcional digital preciso (D-pad) como o Xbox Elite ou o DualSense Edge.',
      'Para jogos de corrida: Volantes com force feedback transformam a experiência. Logitech G29 e Thrustmaster T300 são excelentes opções de entrada.',
      'Para FPS e jogos competitivos: Controles com paddles traseiros (como Xbox Elite, DualSense Edge ou Scuf) permitem pular, recarregar e agachar sem tirar o polegar do analógico.',
      'Para jogos de plataforma e ação: O controle padrão do console já é suficiente. O Pro Controller do Nintendo Switch é um dos mais confortáveis para jogos de plataforma.',
      'Na Virtual Games, você encontra orientação especializada para escolher o acessório ideal para seu estilo de jogo.',
    ],
    faqs: [
      { q: 'Vale a pena comprar um controle profissional?', a: 'Para jogadores casuais, não. Para quem joga competitivamente e busca vantagens como paddles e botões programáveis, pode fazer diferença.' },
      { q: 'Fight stick é melhor que controle para jogos de luta?', a: 'Muitos jogadores profissionais preferem fight sticks pela precisão, mas há campeões que usam controle padrão. É uma questão de preferência.' },
    ],
    readingTime: 5,
  },

  // ==================== INSTITUCIONAL ====================
  {
    title: 'Conheça a história da Virtual Games',
    categoria: 'Institucional',
    excerpt: 'Saiba como nasceu a Virtual Games, nossa missão e o que nos motiva a oferecer o melhor serviço de assistência técnica gamer.',
    paragraphs: [
      'A Virtual Games nasceu da paixão por games e da dificuldade de encontrar assistência técnica especializada em consoles e PC Gamer em Santa Maria, RS. Fundada por Emerson Gabriel de Mello Graeff, a empresa começou como um serviço entre amigos e se transformou na assistência técnica mais especializada da região.',
      'Desde 2020, já realizamos mais de 2.000 reparos em consoles e computadores. O que nos motiva é ver cada gamer voltar a jogar com seu equipamento funcionando perfeitamente.',
      'Nossa equipe é formada por gamers que entendem a urgência de ter o equipamento de volta. Sabemos o que é ficar sem jogar no fim de semana porque o console quebrou. Por isso, trabalhamos com agilidade sem abrir mão da qualidade.',
      'Nossos valores são simples: transparência no diagnóstico, qualidade nas peças, respeito ao cliente e paixão pelo universo gamer. Não somos uma assistência genérica, somos especialistas em consoles.',
      'A Virtual Games está localizada na Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, Centro, Santa Maria. Funcionamos de segunda a sexta das 9h às 18h30 e aos sábados das 9h às 13h.',
      'Se você ainda não nos conhece, passe na loja ou mande uma mensagem no WhatsApp. Ficaremos felizes em ajudar.',
    ],
    faqs: [
      { q: 'Desde quando a Virtual Games existe?', a: 'Desde 2020. Começamos como um serviço entre amigos gamers e nos tornamos referência em assistência técnica em Santa Maria.' },
      { q: 'Quantos reparos a Virtual Games já realizou?', a: 'Já realizamos mais de 2.000 reparos em consoles, PC Gamer e celulares.' },
    ],
    readingTime: 4,
  },
  {
    title: 'Por que escolher uma assistência técnica especializada?',
    categoria: 'Institucional',
    excerpt: 'Entenda os riscos de levar seu console para assistências não especializadas e por que a especialização faz diferença.',
    paragraphs: [
      'Muitas pessoas tentam economizar levando seus consoles para assistências técnicas genéricas ou técnicos que trabalham com qualquer tipo de eletrônico. Essa economia pode sair cara.',
      'Consoles como PS5, Xbox Series e Nintendo Switch têm particularidades que só quem é especialista conhece. A porta HDMI do PS5, por exemplo, tem um padrão de solda específico.',
      'Uma assistência genérica pode: usar peças incompatíveis, danificar a placa durante o reparo, não identificar corretamente o defeito ou simplesmente piorar o problema. Já recebemos diversos consoles que foram danificados em outras assistências.',
      'Além disso, assistências especializadas investem em equipamentos próprios: estação de retrabalho para microsoldagem, osciloscópio para diagnóstico de placa, fontes ajustáveis para testes.',
      'Na Virtual Games, somos especialistas exclusivamente em consoles e PC Gamer. Não fazemos reparo de eletrodomésticos ou equipamentos genéricos. Nosso foco total é no universo gamer.',
      'Outra vantagem: oferecemos garantia de 90 dias em todos os reparos, enquanto assistências genéricas costumam dar apenas 30 dias. Isso mostra a confiança que temos no nosso trabalho.',
    ],
    faqs: [
      { q: 'Posso levar meu console em qualquer assistência?', a: 'Pode, mas o risco de um reparo mal feito é alto. Consoles exigem conhecimento específico que assistências genéricas não têm.' },
      { q: 'O que fazer se outra assistência danificou meu console?', a: 'Traga para a Virtual Games. Avaliamos o dano e informamos se há possibilidade de recuperação.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Como funciona a garantia de 90 dias da Virtual Games',
    categoria: 'Institucional',
    excerpt: 'Saiba tudo sobre a garantia dos nossos serviços: o que cobre, o que não cobre e como acionar.',
    paragraphs: [
      'Na Virtual Games, todos os reparos têm garantia de 90 dias em peças e mão de obra. Esse é nosso compromisso com a qualidade do serviço prestado.',
      'A garantia cobre: defeitos relacionados ao serviço realizado, falha de peças instaladas durante o reparo e problemas de mão de obra como solda, montagem e configuração.',
      'A garantia não cobre: danos físicos causados após a retirada do equipamento (queda, impacto, líquido), mau uso, intervenção de terceiros e desgaste natural de componentes não relacionados ao reparo.',
      'Para acionar a garantia, entre em contato pelo WhatsApp informando o número da sua OS. Traga o equipamento até nossa loja em Santa Maria, reavaliamos e, se for caso de garantia, corrigimos na hora.',
      'Nosso diferencial: enquanto a maioria das assistências oferece 30 a 90 dias de garantia, nós oferecemos 90 dias para todos os serviços. Isso mostra o nível de confiança no nosso trabalho e na qualidade das peças que usamos.',
      'Importante: guarde o comprovante da ordem de serviço. Ele é essencial para acionar a garantia.',
    ],
    faqs: [
      { q: 'A garantia cobre queda após o reparo?', a: 'Não. Danos físicos causados após a retirada do equipamento não são cobertos pela garantia.' },
      { q: 'Preciso do comprovante para acionar a garantia?', a: 'Sim, o número da OS é necessário para localizar seu histórico de reparo.' },
    ],
    readingTime: 4,
  },
  {
    title: 'Dicas para escolher uma assistência técnica de confiança',
    categoria: 'Institucional',
    excerpt: 'Saiba o que observar ao escolher uma assistência técnica para seu console ou PC Gamer.',
    paragraphs: [
      'Escolher uma assistência técnica para seu console não é tarefa simples. Separamos dicas para fazer a escolha certa.',
      '1. Especialização: A assistência é especializada em consoles ou é genérica? Quanto mais específico o foco, maior o conhecimento técnico.',
      '2. Diagnóstico gratuito: Assistências sérias oferecem diagnóstico sem custo. Desconfie de quem cobra apenas para olhar o equipamento.',
      '3. Transparência: O diagnóstico deve ser claro e explicado em linguagem simples. Você deve saber exatamente qual é o problema antes de autorizar.',
      '4. Garantia: Toda assistência de qualidade oferece garantia. A média do mercado é de 90 dias. Desconfie de quem não dá garantia nenhuma.',
      '5. Referências: Procure avaliações no Google e redes sociais. Clientes satisfeitos são o melhor indicador da qualidade do serviço.',
      'Na Virtual Games, atendemos a todos esses critérios. Temos diagnóstico gratuito, garantia de 90 dias, transparência total e mais de 2.000 reparos realizados.',
    ],
    faqs: [
      { q: 'É seguro deixar o console na assistência?', a: 'Sim, em assistências confiáveis. Na Virtual Games, seu equipamento fica registrado em nosso sistema com OS e você acompanha o status online.' },
      { q: 'O que fazer se a assistência não resolver?', a: 'Procure o Procon se houver má fé. Se for incompetência técnica, leve a outro profissional.' },
    ],
    readingTime: 5,
  },
  {
    title: 'LGPD e privacidade: Como protegemos seus dados na Virtual Games',
    categoria: 'Institucional',
    excerpt: 'Saiba como a Virtual Games trata seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados.',
    paragraphs: [
      'A privacidade dos nossos clientes é levada a sério na Virtual Games. Em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018), adotamos práticas rigorosas para proteger suas informações.',
      'Coletamos apenas os dados necessários para a prestação dos serviços: nome completo, WhatsApp/telefone, CPF (para nota fiscal e garantia), e-mail (opcional) e informações sobre o equipamento.',
      'Seus dados são utilizados exclusivamente para: emissão de ordem de serviço, comunicação sobre o andamento do reparo, emissão de nota fiscal, acionamento de garantia e contato para autorização de orçamento.',
      'Não compartilhamos seus dados com terceiros, exceto quando exigido por lei. Seus dados são armazenados em servidores seguros conforme as exigências legais.',
      'Você tem direito de acessar, corrigir, excluir seus dados ou revogar consentimento a qualquer momento. Para exercer esses direitos, entre em contato pelo e-mail contato@virtualgames.com.',
      'Nosso site pode utilizar cookies essenciais para funcionamento. Não utilizamos cookies de rastreamento publicitário.',
    ],
    faqs: [
      { q: 'Preciso fornecer CPF para o reparo?', a: 'Sim, o CPF é necessário para emissão de nota fiscal e registro da garantia. Não utilizamos para outros fins.' },
      { q: 'Meus dados ficam salvos por quanto tempo?', a: 'Pelo tempo necessário para cumprir as obrigações legais e fiscais, conforme determina a legislação brasileira.' },
    ],
    readingTime: 4,
  },

  // ==================== JOGOS ====================
  {
    title: 'Os jogos mais aguardados de 2026',
    categoria: 'Jogos',
    excerpt: 'Confira a lista dos jogos mais esperados para 2026, com lançamentos para PS5, Xbox, Switch 2 e PC.',
    paragraphs: [
      'O ano de 2026 promete ser um dos mais empolgantes da história dos videogames. Com o Nintendo Switch 2 já consolidado, o PS5 Pro em pleno vapor e o PC Gamer cada vez mais forte, a safra de lançamentos é de tirar o fôlego.',
      'Grand Theft Auto VI: O jogo mais esperado da década finalmente chega em 2026. A Rockstar promete uma experiência ainda mais imersiva em Vice City, com gráficos de ponta e um mundo aberto sem precedentes.',
      'Ghost of Yotei: A sequência de Ghost of Tsushima leva os jogadores para o Japão feudal do século XVII, com novos personagens e mecânicas refinadas. Exclusivo para PS5.',
      'Metroid Prime 4: Depois de anos de espera, a Samus Aran finalmente retorna em um novo capítulo da aclamada série Metroid Prime para Nintendo Switch 2.',
      'Death Stranding 2: Hideo Kojima continua sua obra surreal com Death Stranding 2, prometendo uma narrativa ainda mais profunda e mecânicas de gameplay expandidas.',
      'Fable: A série clássica da Microsoft retorna em um reboot para Xbox Series e PC, prometendo o humor e a liberdade característicos da franquia com gráficos de nova geração.',
      'Marvel\'s Wolverine: A Insomniac Games, responsável por Spider-Man, traz Wolverine em uma aventura solo. Promete ser um dos exclusivos mais violentos e emocionantes do PS5.',
      'Além desses, 2026 terá novos títulos de franquias como Assassin\'s Creed, Final Fantasy e Pokémon. Será um ano para o gamer gastar o 13o salário!',
    ],
    faqs: [
      { q: 'GTA 6 vai sair para PC no lançamento?', a: 'Historicamente, a Rockstar lança GTA primeiro nos consoles e depois no PC. GTA 6 deve chegar aos consoles em 2026 e ao PC em 2027.' },
      { q: 'Quais jogos de 2026 são exclusivos?', a: 'Ghost of Yotei e Marvel\'s Wolverine são exclusivos PlayStation. Metroid Prime 4 é exclusivo Nintendo Switch 2. Fable é exclusivo Xbox/PC.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Melhores jogos gratuitos para jogar em 2025',
    categoria: 'Jogos',
    excerpt: 'Seleção dos melhores jogos gratuitos disponíveis para todas as plataformas.',
    paragraphs: [
      'Jogar bem não precisa custar caro. Existe uma vasta biblioteca de jogos gratuitos de alta qualidade disponíveis em todas as plataformas. Selecionamos os melhores.',
      '1. Fortnite: O battle royale da Epic Games continua sendo um dos jogos mais populares do mundo. Constantes atualizações, eventos ao vivo e modos criativos garantem diversão sem fim.',
      '2. Call of Duty: Warzone 2.0: O battle royale da Activision segue forte, com mecânicas refinadas e gráficos impressionantes para um jogo gratuito.',
      '3. Apex Legends: O shooter de heróis da Respawn oferece gameplay rápido e competitivo.',
      '4. Rocket League: Carros jogando futebol. Simples, viciante e gratuito. Um dos jogos mais originais e divertidos da última década.',
      '5. Genshin Impact: RPG de mundo aberto com gráficos dignos de console de última geração. Gratuito para jogar, com conteúdo novo a cada mês.',
      '6. Valorant: O FPS tático da Riot Games é uma excelente alternativa gratuita ao CS2.',
      '7. Overwatch 2: O hero shooter da Blizzard está gratuito e oferece uma experiência de alta qualidade para quem gosta de FPS com classes.',
    ],
    faqs: [
      { q: 'Jogos gratuitos realmente são de graça?', a: 'Sim, são totalmente gratuitos para baixar e jogar. Alguns têm microtransações para itens cosméticos, mas não são necessárias.' },
      { q: 'Preciso de assinatura para jogar online?', a: 'No PS5 e Xbox, sim. No PC e Nintendo Switch, o online é gratuito.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Jogos que marcaram a história dos videogames',
    categoria: 'Jogos',
    excerpt: 'Uma viagem pelos jogos que definiram gerações e mudaram para sempre a indústria dos games.',
    paragraphs: [
      'Alguns jogos transcendem o entretenimento e se tornam verdadeiros marcos culturais. Selecionamos aqueles que, de alguma forma, mudaram o rumo da indústria.',
      'Super Mario Bros. (1985): O jogo que salvou a indústria dos videogames após a crise de 1983. Definiu o gênero de plataforma e apresentou ao mundo o personagem mais icônico dos games.',
      'The Legend of Zelda: Ocarina of Time (1998): Considerado por muitos o melhor jogo de todos os tempos. Pioneiro em jogos 3D de aventura.',
      'Grand Theft Auto III (2001): Revolucionou o conceito de mundo aberto e mostrou que videogames podiam contar histórias maduras.',
      'Half-Life 2 (2004): Estabeleceu novos padrões para narrativa em primeira pessoa, física de objetos e inteligência artificial.',
      'World of Warcraft (2004): Levou os MMOs ao mainstream e criou uma comunidade global que existe até hoje.',
      'The Last of Us (2013): Elevou a narrativa nos videogames a um patamar cinematográfico.',
      'Elden Ring (2022): Redefiniu o gênero soulslike com um mundo aberto magistral e se tornou um dos jogos mais premiados da história.',
    ],
    faqs: [
      { q: 'Qual é considerado o melhor jogo de todos os tempos?', a: 'Não há consenso, mas The Legend of Zelda: Ocarina of Time, The Last of Us e Elden Ring estão frequentemente no topo das listas.' },
      { q: 'Qual jogo vendeu mais cópias da história?', a: 'Minecraft é o jogo mais vendido de todos os tempos, com mais de 300 milhões de cópias.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Guia para montar sua biblioteca de jogos com economia',
    categoria: 'Jogos',
    excerpt: 'Dicas para comprar jogos mais baratos, aproveitar promoções e montar uma biblioteca sem gastar uma fortuna.',
    paragraphs: [
      'Manter uma biblioteca de jogos atualizada pode pesar no bolso, mas com algumas estratégias é possível jogar muito gastando pouco.',
      '1. Assine serviços de assinatura: PlayStation Plus Extra, Game Pass Ultimate e Nintendo Switch Online dão acesso a centenas de jogos por um valor mensal.',
      '2. Aproveite promoções: Steam, PlayStation Store e Microsoft Store fazem promoções sazonais com descontos de 50% a 90%.',
      '3. Compre jogos em mídia física usada: Jogos físicos usados podem custar de 30% a 50% menos que os novos.',
      '4. Epic Games Store: A Epic dá pelo menos dois jogos grátis por semana. Ao longo de um ano, você acumula dezenas de jogos sem pagar nada.',
      '5. Não compre no lançamento: Jogos dropsam de preço rapidamente. Em 3 a 6 meses, muitos títulos AAA já estão com 30% a 50% de desconto.',
      'Com essas dicas, é possível manter uma biblioteca de dezenas de jogos gastando uma fração do valor de mercado.',
    ],
    faqs: [
      { q: 'Vale a pena assinar vários serviços?', a: 'Depende do seu tempo de jogo. Se joga muito, sim. Se joga poucas horas por semana, comprar jogos avulsos em promoção compensa mais.' },
      { q: 'Jogos da Epic Store são realmente grátis?', a: 'Sim, uma vez resgatados, ficam na sua biblioteca para sempre, mesmo sem assinatura.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Jogos cooperativos para jogar com amigos em 2025',
    categoria: 'Jogos',
    excerpt: 'Seleção dos melhores jogos coop para jogar com amigos, online ou no mesmo sofá.',
    paragraphs: [
      'Nada melhor que jogar com os amigos. Selecionamos os melhores jogos cooperativos de 2025 para todas as plataformas.',
      '1. It Takes Two: O jogo cooperativo mais premiado da história. Exclusivamente cooperativo, conta a história de um casal que precisa trabalhar junto para superar desafios.',
      '2. Overcooked 2: Caos na cozinha. Testa a amizade e a comunicação. Perfeito para jogar no mesmo sofá com até 4 jogadores.',
      '3. Minecraft: O clássico dos clássicos. Construir, explorar e sobreviver juntos nunca envelhece.',
      '4. Baldur\'s Gate 3: O RPG do ano permite campanha completa em coop com até 4 jogadores.',
      '5. Fortnite: Battle royale gratuito com suporte a squad de até 4 jogadores.',
      '6. Sea of Thieves: Pirataria em mundo aberto com tripulação de até 4 jogadores.',
      '7. Super Mario Party Jamboree (Switch 2): O party game definitivo da Nintendo.',
    ],
    faqs: [
      { q: 'Qual o melhor jogo cooperativo para casais?', a: 'It Takes Two foi projetado especificamente para jogar a dois e é a melhor experiência cooperativa para casais.' },
      { q: 'Preciso de quantos controles para jogar no mesmo sofá?', a: 'Depende do jogo. A maioria suporta 2 a 4 controles no mesmo console.' },
    ],
    readingTime: 5,
  },

  // ==================== NINTENDO ====================
  {
    title: 'Nintendo Switch 2: Tudo o que você precisa saber',
    categoria: 'Nintendo',
    excerpt: 'Guia completo sobre o Nintendo Switch 2: specs, preço, lançamentos e se vale a pena comprar.',
    paragraphs: [
      'O Nintendo Switch 2 foi lançado em junho de 2025 e já se tornou um fenômeno de vendas, ultrapassando 10 milhões de unidades nos primeiros meses. Reunimos tudo o que você precisa saber sobre o novo console da Nintendo.',
      'O Switch 2 traz uma tela OLED de 8 polegadas com resolução de 1080p (no modo portátil) e suporte a 120 Hz. No modo dock, ele alcança 4K a 60 fps. Os novos Joy-Con 2 têm hall effect sensors, que eliminam o drift, um dos maiores problemas do Switch original.',
      'O console é totalmente compatível com os jogos do Switch original, tanto físicos quanto digitais. Isso significa que sua biblioteca de jogos não fica para trás.',
      'Os títulos de lançamento incluem Mario Kart World, The Legend of Zelda: Echoes of Wisdom, Metroid Prime 4, Pokémon Legends: Z-A e Super Mario Party Jamboree.',
      'Com preço sugerido de US$ 399 (modelo básico) a US$ 449 (com Mario Kart World incluso), o Switch 2 custa menos que PS5 Pro e Xbox Series X.',
      'A bateria dura até 8 horas no modo portátil, dependendo do jogo. O carregamento é via USB-C e o dock mantém o design híbrido característico da Nintendo.',
      'Vale a pena comprar? Se você já tem um Switch e está satisfeito, pode esperar. Mas se quer a melhor experiência Nintendo com gráficos modernos e sem drift nos controles, o Switch 2 é a escolha certa.',
    ],
    faqs: [
      { q: 'Switch 2 roda jogos do Switch antigo?', a: 'Sim, total compatibilidade retroativa com jogos físicos e digitais do Nintendo Switch original.' },
      { q: 'Switch 2 tem drift?', a: 'Não. Os novos Joy-Con 2 usam sensores hall effect, que são imunes ao desgaste que causa drift.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Melhores jogos de Nintendo Switch 2 para comprar em 2025',
    categoria: 'Nintendo',
    excerpt: 'Seleção dos melhores jogos já disponíveis para o Nintendo Switch 2.',
    paragraphs: [
      'O Nintendo Switch 2 chegou com uma biblioteca de lançamento impressionante. Selecionamos os melhores títulos já disponíveis para o novo console.',
      'Mario Kart World: O novo Mario Kart é um show à parte. Pistas enormes, 24 jogadores simultâneos, gráficos em 4K e novas mecânicas como paredes escaláveis e circuitos aéreos.',
      'The Legend of Zelda: Echoes of Wisdom: Pela primeira vez, a princesa Zelda é a protagonista. Uma aventura que expande o conceito de Tears of the Kingdom com novos poderes.',
      'Metroid Prime 4: Após anos de desenvolvimento, a nova aventura de Samus Aran finalmente chegou. Gráficos de tirar o fôlego e combate refinado.',
      'Pokémon Legends: Z-A: Ambientado na região de Kalos, com a cidade de Lumiose como cenário principal. Combates em tempo real e mecânicas de captura inovadoras.',
      'Super Mario Party Jamboree: O party game definitivo, com 7 tabuleiros, mais de 110 minigames e modos online.',
      'Todos esses jogos aproveitam o hardware do Switch 2 com gráficos superiores, carregamento mais rápido e recursos exclusivos dos Joy-Con 2.',
    ],
    faqs: [
      { q: 'Quais jogos vêm no pacote do Switch 2?', a: 'O bundle de US$ 449 inclui Mario Kart World digital. O modelo básico de US$ 399 não vem com jogo incluso.' },
      { q: 'Vale a pena comprar jogos de Switch no Switch 2?', a: 'Sim, todos os jogos de Switch são compatíveis e muitos recebem patches gratuitos de melhoria.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Como resolver problemas comuns no Nintendo Switch',
    categoria: 'Nintendo',
    excerpt: 'Guia de soluções para os problemas mais frequentes no Nintendo Switch, Switch Lite e Switch OLED.',
    paragraphs: [
      'Mesmo sendo um console robusto, o Nintendo Switch pode apresentar problemas com o tempo. Listamos os mais comuns e como resolvê-los.',
      'Drift nos Joy-Con: O problema mais famoso do Switch. Os analógicos registram movimento sem comando. A solução definitiva é a troca dos módulos analógicos.',
      'Switch não liga: Pode ser bateria descarregada, fonte com problema ou defeito na placa. Tente manter o botão power pressionado por 15 segundos.',
      'Bateria não carrega: Geralmente é a porta USB-C danificada ou a bateria que chegou ao fim da vida útil.',
      'Tela quebrada ou trincada: Infelizmente, a tela do Switch é frágil. A troca deve ser feita por profissionais.',
      'Console superaquecendo: Poeira acumulada no sistema de ventilação é a causa mais comum. A limpeza preventiva resolve o problema.',
      'Para qualquer desses problemas, a Virtual Games oferece diagnóstico gratuito em Santa Maria.',
    ],
    faqs: [
      { q: 'Fazem troca de tela de todos os modelos de Switch?', a: 'Sim, realizamos troca de tela para Switch, Switch Lite e Switch OLED. Consulte-nos para mais informações sobre o serviço.' },
      { q: 'Posso trocar a bateria do Switch em casa?', a: 'É possível, mas requer ferramentas específicas. Recomendamos procurar assistência especializada.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Nintendo Switch OLED vs Switch 2: Vale a pena fazer o upgrade?',
    categoria: 'Nintendo',
    excerpt: 'Comparativo entre o Nintendo Switch OLED e o Switch 2 para ajudar na decisão de upgrade.',
    paragraphs: [
      'Com o lançamento do Nintendo Switch 2, muitos donos do Switch OLED se perguntam: vale a pena fazer o upgrade? A resposta depende do seu perfil de uso.',
      'O Switch OLED tem uma tela OLED de 7 polegadas (contra 8 polegadas do Switch 2), resolução de 720p no portátil e 1080p no dock. Ele roda os mesmos jogos desde 2021.',
      'O Switch 2 dá um salto significativo: tela OLED de 8 polegadas com 1080p e 120 Hz no portátil, 4K a 60 fps no dock, Joy-Con 2 sem drift e desempenho muito superior.',
      'Para quem joga apenas no modo portátil e está satisfeito com os jogos atuais, o OLED ainda é um excelente console.',
      'Para quem joga no dock em uma TV 4K e quer aproveitar os novos lançamentos com a melhor qualidade possível, o upgrade faz todo sentido.',
      'Outro fator: os Joy-Con 2 com hall effect sensors eliminam o drift. Se você já trocou de Joy-Con por drift, isso é um bom motivo para considerar o upgrade.',
    ],
    faqs: [
      { q: 'Os acessórios do Switch OLED funcionam no Switch 2?', a: 'Carregadores, cases e cabos funcionam. Os Joy-Con originais não encaixam no Switch 2, mas podem ser conectados via Bluetooth.' },
      { q: 'O Switch 2 é mais pesado que o OLED?', a: 'Sim, é ligeiramente mais pesado devido à tela maior, mas a diferença é pequena.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Os melhores acessórios para Nintendo Switch em 2025',
    categoria: 'Nintendo',
    excerpt: 'Guia de acessórios essenciais para aproveitar ao máximo seu Nintendo Switch e Switch 2.',
    paragraphs: [
      'Alguns acessórios podem transformar a experiência com seu Nintendo Switch. Selecionamos os melhores para 2025.',
      '1. Pro Controller: O controle oficial da Nintendo é muito mais confortável que os Joy-Con para longas sessões no modo dock.',
      '2. Carregador portátil (Power Bank): A bateria do Switch dura de 4 a 8 horas. Um power bank de 20.000 mAh é essencial para viagens.',
      '3. Case de transporte: Protege o console durante viagens. Modelos com espaço para jogos são os mais práticos.',
      '4. Suporte ajustável: Para usar o Switch no modo mesa de forma confortável.',
      '5. Controle 8BitDo Pro 2: Excelente alternativa ao Pro Controller, com botões programáveis.',
      '6. Cartão microSD: Um cartão de 256 GB ou 512 GB é essencial para quem compra jogos digitais.',
      'Na Virtual Games, você encontra orientação sobre os melhores acessórios para seu modelo de Switch.',
    ],
    faqs: [
      { q: 'Qual microSD comprar para o Switch?', a: 'Recomendamos cartões UHS-I de 256 GB ou 512 GB. Marcas como Samsung EVO e SanDisk Extreme são confiáveis.' },
      { q: 'Vale a pena comprar o Pro Controller?', a: 'Sim, especialmente se você joga muito no modo dock. É muito mais ergonômico que os Joy-Con.' },
    ],
    readingTime: 5,
  },

  // ==================== PC GAMER ====================
  {
    title: 'Como montar um PC Gamer custo-benefício em 2025',
    categoria: 'PC Gamer',
    excerpt: 'Guia completo para montar um PC Gamer com o melhor custo-benefício em 2025, com opções para todos os orçamentos.',
    paragraphs: [
      'Montar um PC Gamer em 2025 está mais acessível do que nunca. Com a competição acirrada entre Intel e AMD e entre Nvidia e AMD, é possível montar máquinas excelentes para diferentes orçamentos.',
      'Orçamento de R$ 4.000 a R$ 5.000: Um PC de entrada capaz de rodar eSports (Valorant, CS2, Fortnite) em 1080p a 60+ fps com Ryzen 5 8600G (com vídeo integrado) ou Ryzen 5 5500 + RX 6600.',
      'Orçamento de R$ 6.000 a R$ 8.000: O ponto ideal de custo-benefício. Ryzen 7 5700X ou Intel i5-13400F com uma RTX 4060 ou RX 7700 XT. Roda qualquer jogo em 1080p/1440p no alto.',
      'Orçamento de R$ 10.000 a R$ 15.000: PC de alto desempenho. Ryzen 7 7800X3D ou Intel i7-14700K com RTX 4070 Super ou RX 7800 XT. 1440p no ultra ou 4K no médio/alto.',
      'Acima de R$ 15.000: O topo de linha. Ryzen 9 7950X3D ou Intel i9-14900K com RTX 4080 Super ou RTX 4090. 4K no ultra com altas taxas de quadros.',
      'Dica importante: invista mais na placa de vídeo que no processador para jogos. Um Ryzen 5 com RTX 4070 entrega mais fps que um Ryzen 9 com RTX 4060.',
      'Na Virtual Games, oferecemos consultoria gratuita para montagem de PC Gamer.',
    ],
    faqs: [
      { q: 'Qual a diferença entre Intel e AMD em 2025?', a: 'A AMD lidera em jogos com os processadores 3D V-Cache (X3D). A Intel lidera em tarefas profissionais.' },
      { q: 'Vale a pena montar PC ou comprar montado?', a: 'Montar você mesmo pode economizar de 10% a 20%. Se não tem experiência, contrate uma assistência.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Placa de vídeo: Qual escolher para cada orçamento em 2025',
    categoria: 'PC Gamer',
    excerpt: 'Guia completo de placas de vídeo para PC Gamer em 2025, da RTX 4060 à RTX 5090.',
    paragraphs: [
      'A placa de vídeo é o componente mais importante para jogos. Em 2025, o mercado está repleto de opções para todos os orçamentos.',
      'Nvidia RTX 4060 (R$ 1.800 a R$ 2.200): A porta de entrada para jogos em 1080p no ultra e 1440p no médio. DLSS 3.5 e bom consumo de energia.',
      'AMD RX 7700 XT (R$ 2.500 a R$ 3.000): Excelente custo-benefício para 1440p. Performance superior à RTX 4060 Ti por um preço menor.',
      'Nvidia RTX 4070 Super (R$ 3.500 a R$ 4.200): O padrão ouro para 1440p no ultra. DLSS 3.5 e bom desempenho em ray tracing.',
      'AMD RX 7800 XT (R$ 3.200 a R$ 3.800): Concorrente direta da RTX 4070, com mais VRAM (16 GB).',
      'Nvidia RTX 4080 Super (R$ 6.000 a R$ 7.500): Para 4K no alto/ultra. Desempenho excepcional em ray tracing.',
      'Nvidia RTX 5090 (R$ 12.000+): A mais potente do mercado. 4K no ultra com ray tracing máximo.',
      'Dica: para 1080p, RTX 4060 é suficiente. Para 1440p, RTX 4070 Super ou RX 7800 XT. Para 4K, RTX 4080 Super ou superior.',
    ],
    faqs: [
      { q: 'Vale a pena comprar placa de vídeo usada?', a: 'Sim, mas com cautela. Prefira placas que não foram usadas para mineração.' },
      { q: 'Qual placa da AMD é equivalente à RTX 4070?', a: 'A RX 7800 XT é a concorrente direta, com performance similar e mais VRAM (16 GB contra 12 GB).' },
    ],
    readingTime: 6,
  },
  {
    title: 'Refrigeração: Air cooling vs Water cooling para PC Gamer',
    categoria: 'PC Gamer',
    excerpt: 'Comparativo completo entre refrigeração a ar e water cooler para PC Gamer. Qual escolher?',
    paragraphs: [
      'Na hora de montar ou fazer upgrade do PC Gamer, uma dúvida comum é: qual sistema de refrigeração escolher?',
      'Air cooling (cooler a ar): Mais simples, mais barato e praticamente livre de manutenção. Um bom air cooler como o Cooler Master Hyper 212 ou o Noctua NH-D15 tem desempenho comparável a water coolers de 240 mm.',
      'Water cooling (water cooler AIO): Mais eficiente na dissipação de calor, permite overclock mais agressivo e deixa o visual do PC mais limpo. Modelos de 240 mm e 360 mm são os mais comuns.',
      'Para processadores de entrada e médio (Ryzen 5, Intel i5), um air cooler de qualidade é suficiente. Para processadores high-end (Ryzen 7/9, Intel i7/i9), um water cooler de 240 mm ou 360 mm é recomendado.',
      'Na Virtual Games, realizamos instalação de sistemas de refrigeração e troca de pasta térmica com garantia de 90 dias.',
    ],
    faqs: [
      { q: 'Water cooler pode vazar?', a: 'É raro em modelos de marcas confiáveis (Corsair, NZXT, Cooler Master). Modelos mais baratos têm maior risco.' },
      { q: 'Qual a vida útil de um water cooler?', a: 'Em média, de 3 a 5 anos. Após esse período, a bomba pode começar a falhar.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Guia de manutenção preventiva para PC Gamer',
    categoria: 'PC Gamer',
    excerpt: 'Passo a passo para manter seu PC Gamer funcionando como novo por mais tempo.',
    paragraphs: [
      'A manutenção preventiva é essencial para a longevidade do seu PC Gamer. Com cuidados regulares, você evita problemas de superaquecimento e falhas prematuras.',
      'Limpeza interna: A cada 6 meses, abra o gabinete e remova a poeira acumulada nos fans, filtros e dissipadores. Use ar comprimido ou pincel antiestático.',
      'Troca de pasta térmica: A cada 12 a 18 meses, troque a pasta térmica do processador e da placa de vídeo.',
      'Gerenciamento de cabos: Cabos mal organizados obstruem o fluxo de ar. Um bom cable management reduz a temperatura interna em 3 a 5 graus.',
      'Atualização de drivers: Mantenha os drivers da placa de vídeo, chipset e BIOS atualizados.',
      'Na Virtual Games, oferecemos serviço completo de limpeza e manutenção preventiva para PC Gamer, com garantia de 90 dias.',
    ],
    faqs: [
      { q: 'Com que frequência devo limpar meu PC Gamer?', a: 'Recomendamos limpeza interna a cada 6 meses. Se o ambiente tiver muita poeira, a cada 3 meses.' },
      { q: 'Posso limpar o PC com aspirador?', a: 'Não use aspirador comum, que gera estática. Use ar comprimido ou aspirador próprio para eletrônicos.' },
    ],
    readingTime: 5,
  },
  {
    title: 'SSD vs NVMe: Qual a diferença e qual escolher em 2025?',
    categoria: 'PC Gamer',
    excerpt: 'Entenda as diferenças entre SSD SATA, SSD NVMe e NVMe PCIe 5.0 para seu PC Gamer.',
    paragraphs: [
      'Na hora de escolher o armazenamento do seu PC Gamer, as opções podem confundir. Vamos explicar as diferenças.',
      'SSD SATA: O padrão mais antigo, com velocidade de até 550 MB/s. Ainda é uma boa opção para upgrades em PCs mais antigos.',
      'SSD NVMe PCIe 3.0: Velocidades de até 3.500 MB/s. Até 7 vezes mais rápido que o SATA. Excelente custo-benefício.',
      'SSD NVMe PCIe 4.0: Velocidades de até 7.000 MB/s. O padrão atual para PCs Gamer de médio e alto desempenho.',
      'SSD NVMe PCIe 5.0: Velocidades de até 10.000 MB/s ou mais. Ainda caro, mas ideal para quem quer o máximo de performance.',
      'Para jogos, a diferença prática entre um NVMe 3.0 e um 5.0 é de apenas alguns segundos nos carregamentos.',
      'Recomendação: use um NVMe PCIe 4.0 de 1 TB para o sistema e jogos principais, e um SSD SATA ou HD de 2 TB para armazenamento secundário.',
    ],
    faqs: [
      { q: 'Preciso de SSD NVMe para jogar?', a: 'Não, um SSD SATA já elimina os gargalos de carregamento. O NVMe faz diferença em transferência de arquivos.' },
      { q: 'Qual marca de SSD recomendar?', a: 'Samsung (990 Pro), WD (SN850X), Kingston (KC3000) e Corsair (MP600) são marcas confiáveis.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Processador: Intel vs AMD em 2025 Qual escolher?',
    categoria: 'PC Gamer',
    excerpt: 'Comparativo completo entre processadores Intel e AMD para PC Gamer em 2025.',
    paragraphs: [
      'A rivalidade entre Intel e AMD está mais acirrada do que nunca. Em 2025, ambas as marcas oferecem processadores excelentes para jogos.',
      'AMD Ryzen 7000 e 9000: Os processadores da AMD continuam liderando em jogos graças à tecnologia 3D V-Cache. O Ryzen 7 7800X3D é considerado o melhor processador para jogos puros.',
      'Intel Core 13a, 14a e Ultra: A Intel aposta em altas frequências e bom desempenho multitarefa. Excelentes para quem também edita vídeo ou faz streaming.',
      'Em jogos, o Ryzen 7 7800X3D lidera na maioria dos títulos. O Intel i7-14700K empata ou supera em alguns jogos que favorecem altas frequências.',
      'A plataforma AM5 da AMD tem suporte prometido para futuras gerações. A Intel troca de soquete com mais frequência.',
      'Conclusão: para jogos puros, AMD Ryzen 7 7800X3D é a melhor escolha. Para uso misto, Intel i7-14700K ou i9-14900K são excelentes.',
    ],
    faqs: [
      { q: 'Qual placa-mãe usar com Ryzen 7800X3D?', a: 'Qualquer placa-mãe AM5 com chipset B650 ou X670. O B650 oferece o melhor custo-benefício.' },
      { q: 'Intel ou AMD é melhor para upgrade futuro?', a: 'AMD leva vantagem porque a plataforma AM5 tem suporte prometido para várias gerações.' },
    ],
    readingTime: 6,
  },

  // ==================== XBOX ====================
  {
    title: 'Xbox Game Pass: Vale a pena assinar em 2025?',
    categoria: 'Xbox',
    excerpt: 'Análise completa do Xbox Game Pass em 2025: catálogo, preços, vantagens e se realmente compensa.',
    paragraphs: [
      'O Xbox Game Pass é o serviço de assinatura de jogos mais famoso do mundo. Mas será que ainda vale a pena em 2025? Vamos analisar.',
      'O Game Pass Ultimate custa cerca de R$ 60 por mês e dá acesso a centenas de jogos no console e PC, jogos de lançamento day one (como Call of Duty, Diablo e novos títulos da Activision Blizzard), EA Play, Xbox Cloud Gaming e multiplayer online.',
      'O catálogo em 2025 está impressionante. Com a aquisição da Activision Blizzard pela Microsoft, jogos como Call of Duty: Black Ops 7, Diablo V e Overwatch 3 chegam day one no serviço.',
      'Para quem joga de 2 a 3 jogos completos por ano, o Game Pass já se paga. Três jogos novos custariam de R$ 750 a R$ 1.200, contra R$ 720 do Game Pass anual.',
      'O Cloud Gaming é um diferencial enorme. Você pode jogar títulos de Xbox em celulares, tablets e PCs fracos via streaming.',
      'Para quem joga casualmente ou gosta de experimentar jogos diferentes, o Game Pass é imbatível.',
    ],
    faqs: [
      { q: 'Jogos do Game Pass saem do catálogo?', a: 'Sim, jogos de terceiros entram e saem. Jogos first party (Microsoft, Activision, Bethesda) ficam permanentemente.' },
      { q: 'Game Pass funciona no PC?', a: 'Sim, o Game Pass Ultimate e o PC Game Pass dão acesso aos jogos no computador.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Problemas comuns no Xbox e como resolver',
    categoria: 'Xbox',
    excerpt: 'Guia de soluções para os problemas mais frequentes em Xbox Series X, Series S e Xbox One.',
    paragraphs: [
      'O Xbox é um console confiável, mas como qualquer eletrônico, pode apresentar problemas. Listamos os mais comuns.',
      'Xbox não liga: Verifique o cabo de força e a tomada. Se o console emitir um bipe mas não ligar, pode ser problema na fonte.',
      'Superaquecimento e desligamento: O Xbox desliga sozinho para proteger os componentes. A limpeza preventiva com troca de pasta térmica resolve.',
      'Porta HDMI sem sinal: Geralmente causado por puxar o cabo HDMI sem segurar o conector. A troca da porta HDMI resolve.',
      'Disco que não lê (Series X): Pode ser sujeira no leitor ou falha mecânica.',
      'Ruído excessivo do cooler: Indica acúmulo de poeira ou desgaste do rolamento do ventilador.',
      'Na Virtual Games, oferecemos diagnóstico gratuito para todos os modelos de Xbox em Santa Maria.',
    ],
    faqs: [
      { q: 'Meu Xbox desliga sozinho, o que pode ser?', a: 'Superaquecimento é a causa mais provável. A limpeza interna resolve na maioria dos casos.' },
      { q: 'Quanto custa o reparo da porta HDMI do Xbox?', a: 'A partir de R$ 250, com garantia de 90 dias. O diagnóstico é gratuito.' },
    ],
    readingTime: 6,
  },
  {
    title: 'Xbox Series X vs Xbox Series S: Guia de compra definitivo',
    categoria: 'Xbox',
    excerpt: 'Comparativo completo entre Xbox Series X e Series S para ajudar na sua escolha.',
    paragraphs: [
      'A Microsoft oferece duas opções de console de nona geração: o potente Xbox Series X e o acessível Xbox Series S.',
      'O Xbox Series X é o console topo de linha com 12 TFLOPS, 1 TB de SSD e leitor de disco 4K. Ele roda jogos em 4K nativo a 60 fps (até 120 fps em títulos competitivos).',
      'O Xbox Series S é a opção de entrada. Com 4 TFLOPS e sem leitor de disco, ele foca em resolução 1440p (com upscale para 4K). É o console mais compacto e silencioso da geração.',
      'Na prática: o Series X é para quem tem TV 4K e quer a máxima qualidade. O Series S é perfeito para quem joga em monitor Full HD ou 1440p.',
      'Ambos têm acesso aos mesmos jogos e serviços (Game Pass) e funcionalidades como Quick Resume.',
      'Conclusão: Series X para entusiastas com TV 4K. Series S para quem busca custo-benefício.',
    ],
    faqs: [
      { q: 'O Series S roda em 4K?', a: 'Ele faz upscale para 4K, mas a resolução nativa é 1440p.' },
      { q: 'O Series S tem saída de disco?', a: 'Não, o Series S é totalmente digital.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Como melhorar o desempenho do seu Xbox',
    categoria: 'Xbox',
    excerpt: 'Dicas práticas para extrair o máximo de performance do seu Xbox Series X, Series S ou Xbox One.',
    paragraphs: [
      'Seu Xbox pode estar entregando menos desempenho do que deveria. Algumas configurações podem fazer diferença.',
      '1. Ative o Modo Jogo: Vá em Configurações > Geral > Modo Jogo e ative. Isso prioriza recursos para jogos.',
      '2. Mantenha o console ventilado: O superaquecimento causa redução automática de desempenho.',
      '3. Limpeza regular: Poeira acumulada reduz a eficiência da refrigeração.',
      '4. Ajuste as configurações de vídeo: Ative 4K, HDR e 120 Hz nas configurações de tela.',
      '5. Manter o sistema atualizado: A Microsoft lança atualizações regulares que melhoram desempenho.',
      'Se o desempenho não estiver bom, pode ser problema de hardware. Traga para diagnóstico gratuito na Virtual Games.',
    ],
    faqs: [
      { q: 'Vale a pena usar SSD externo no Xbox?', a: 'Sim, para jogos de Xbox One, um SSD externo reduz muito os tempos de carregamento.' },
      { q: 'Como saber se meu Xbox está superaquecendo?', a: 'Sintomas: desligamento repentino, barulho excessivo do cooler e lentidão na interface.' },
    ],
    readingTime: 5,
  },
  {
    title: 'Melhores jogos de Xbox em 2025',
    categoria: 'Xbox',
    excerpt: 'Seleção dos melhores jogos disponíveis para Xbox Series X, Series S e Xbox One em 2025.',
    paragraphs: [
      'O ecossistema Xbox está mais forte do que nunca em 2025. Com a Activision Blizzard no grupo Microsoft, a biblioteca do Xbox está repleta de títulos imperdíveis.',
      'Call of Duty: Black Ops 7: Campanha cinematográfica e multiplayer viciante. Day one no Game Pass.',
      'Fable (reboot): O aguardado retorno da série clássica da Microsoft. Exclusivo Xbox e PC.',
      'Starfield: Shattered Space: A expansão do RPG espacial da Bethesda adiciona novas missões e planetas.',
      'Forza Motorsport 8: A série de corrida mais realista do Xbox está de volta.',
      'Diablo V: Novo sistema de habilidades, classes inéditas e endgame profundo. Day one no Game Pass.',
      'Gears of War: E-Day: A prequência da série de ação da The Coalition com gráficos impressionantes.',
    ],
    faqs: [
      { q: 'Preciso de Game Pass para jogar online no Xbox?', a: 'Sim, o Game Pass Core ou Ultimate é necessário para jogar online no Xbox.' },
      { q: 'Jogos de Xbox One rodam no Series X/S?', a: 'Sim, a grande maioria é compatível, muitos com melhorias de desempenho.' },
    ],
    readingTime: 6,
  },
];

async function main() {
  console.log('Iniciando seed do blog...');

  const author = await prisma.blogAuthor.upsert({
    where: { slug: authorData.slug },
    update: {},
    create: authorData,
  });

  console.log('Autor: ' + author.name + ' (' + author.id + ')');

  let created = 0;
  let skipped = 0;

  for (const post of POSTS) {
    const slug = makeSlug(post.title);

    const exists = await prisma.blogPost.findUnique({ where: { slug } });
    if (exists) {
      console.log('  [SKIP] ' + post.title);
      skipped++;
      continue;
    }

    const faqsJson = post.faqs ? faqBody(post.faqs) : undefined;

    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        categoria: post.categoria,
        publishedAt: new Date(),
        authorId: author.id,
        excerpt: post.excerpt,
        body: makeBody(post.paragraphs) as unknown as Prisma.InputJsonValue,
        faqs: faqsJson as unknown as Prisma.InputJsonValue,
        readingTime: post.readingTime,
        published: true,
      },
    });

    console.log('  [OK] ' + post.title + ' (' + post.categoria + ')');
    created++;
  }

  console.log('\nConcluido! ' + created + ' posts criados, ' + skipped + ' ignorados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
