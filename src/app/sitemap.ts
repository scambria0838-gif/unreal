import type { MetadataRoute } from "next";
import { articles, categories } from "@/lib/articles";

export const dynamic = "force-static";
import { locations } from "@/lib/locations";
import { commercialServices, coreServices, residentialServices } from "@/lib/services";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/residential",
    "/commercial",
    "/portfolio",
    "/case-studies",
    "/intelligence",
    "/locations",
    "/review",
    "/ask-john",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: now,
    })),
    ...coreServices.map((service) => ({
      url: `${site.url}/services/${service.slug}`,
      lastModified: now,
    })),
    ...residentialServices.map((service) => ({
      url: `${site.url}/residential/${service.slug}`,
      lastModified: now,
    })),
    ...commercialServices.map((service) => ({
      url: `${site.url}/commercial/${service.slug}`,
      lastModified: now,
    })),
    ...locations.map((location) => ({
      url: `${site.url}/locations/${location.slug}`,
      lastModified: now,
    })),
    ...categories.map((category) => ({
      url: `${site.url}/intelligence/${category.slug}`,
      lastModified: now,
    })),
    ...articles.map((article) => ({
      url: `${site.url}/intelligence/${article.category}/${article.slug}`,
      lastModified: now,
    })),
  ];
}
