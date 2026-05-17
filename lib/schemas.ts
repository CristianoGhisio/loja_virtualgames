const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const localBusinessSchema: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteUrl}/#empresa`,
  name: "Virtual Games",
  description:
    "Assistência técnica especializada em PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria, RS.",
  url: siteUrl,
  telephone: "+55-55-99725-2786",
  email: "contato@virtualgames.com",
  priceRange: "$$",
  currenciesAccepted: "BRL",
  paymentAccepted: "Dinheiro, PIX, Cartão de Crédito, Cartão de Débito",
  image: `${siteUrl}/og-image.png`,
  logo: `${siteUrl}/og-image.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2",
    addressLocality: "Santa Maria",
    addressRegion: "RS",
    postalCode: "97010-002",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -29.6848,
    longitude: -53.8069,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "13:00",
    },
  ],
  areaServed: {
    "@type": "City",
    name: "Santa Maria",
    containedInPlace: {
      "@type": "State",
      name: "Rio Grande do Sul",
    },
  },
  sameAs: [
    "https://www.instagram.com/virtualgames",
    "https://www.facebook.com/virtualgames",
  ],
  hasMap: "https://maps.google.com/?q=Rua+Venâncio+Aires+1434+Santa+Maria+RS",
};

export const createBreadcrumbSchema = (
  items: { name: string; url?: string }[],
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createFAQPageSchema = (
  questions: { question: string; answer: string }[],
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map((q) => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: q.answer,
    },
  })),
});

export const createServiceSchema = (
  service: {
    name: string;
    description: string;
    serviceType?: string;
    subServices?: { name: string; description: string }[];
  },
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: service.name,
  description: service.description,
  provider: { "@id": `${siteUrl}/#empresa` },
  areaServed: {
    "@type": "City",
    name: "Santa Maria",
  },
  serviceType: service.serviceType || service.name,
  offers: {
    "@type": "Offer",
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "BRL",
      description:
        "Diagnóstico gratuito. Orçamento aprovado pelo cliente.",
    },
  },
  ...(service.subServices &&
    service.subServices.length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `Serviços de ${service.name}`,
        itemListElement: service.subServices.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.description,
          },
        })),
      },
    }),
});

export const aggregateRatingSchema: Record<string, unknown> = {
  "@type": "AggregateRating",
  ratingValue: "5.0",
  reviewCount: "87",
  bestRating: "5",
  worstRating: "1",
};
