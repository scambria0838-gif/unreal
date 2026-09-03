import { site } from "@/lib/site";
import type { Article } from "@/lib/articles";
import type { Service } from "@/lib/services";
import { servicePath } from "@/lib/services";
import type { Location } from "@/lib/locations";

const origin = site.url;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.legalName,
    legalName: site.legalName,
    url: origin,
    telephone: site.phoneHref.replace("tel:", ""),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.mailingAddress.line1,
      addressLocality: site.mailingAddress.city,
      addressRegion: site.mailingAddress.state,
      postalCode: site.mailingAddress.zip,
      addressCountry: "US",
    },
    founder: {
      "@type": "Person",
      name: site.personFull,
    },
    identifier: `Arizona ROC #${site.roc}`,
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "GeneralContractor"],
    name: site.legalName,
    image: `${origin}/og.jpg`,
    url: origin,
    telephone: "+1-602-526-2299",
    email: site.email,
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.mailingAddress.line1,
      addressLocality: site.mailingAddress.city,
      addressRegion: site.mailingAddress.state,
      postalCode: site.mailingAddress.zip,
      addressCountry: "US",
    },
    areaServed: {
      "@type": "State",
      name: "Arizona",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.4942,
      longitude: -111.9261,
    },
    identifier: {
      "@type": "PropertyValue",
      name: "Arizona ROC",
      value: site.roc,
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: site.rocClass,
      recognizedBy: {
        "@type": "Organization",
        name: "Arizona Registrar of Contractors",
        url: site.rocVerifyUrl,
      },
    },
    founder: {
      "@type": "Person",
      name: site.personFull,
      jobTitle: "Qualifying Party / Officer",
    },
    sameAs: [site.rocVerifyUrl],
  };
}

export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: {
      "@type": "GeneralContractor",
      name: site.legalName,
      telephone: "+1-602-526-2299",
    },
    areaServed: "Arizona",
    url: `${origin}${servicePath(service)}`,
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.href}`,
    })),
  };
}

export function articleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    dateModified: article.updated,
    author: {
      "@type": "Person",
      name: site.person,
    },
    publisher: {
      "@type": "Organization",
      name: site.legalName,
    },
    mainEntityOfPage: `${origin}/intelligence/${article.category}/${article.slug}`,
  };
}

export function locationServiceSchema(location: Location) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Construction consulting and permit coordination in ${location.name}`,
    description: location.character,
    areaServed: {
      "@type": "City",
      name: location.name,
      containedInPlace: {
        "@type": "State",
        name: "Arizona",
      },
    },
    provider: {
      "@type": "GeneralContractor",
      name: site.legalName,
    },
    url: `${origin}/locations/${location.slug}`,
  };
}
