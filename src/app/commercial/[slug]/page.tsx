import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceView } from "@/components/pages/ServiceView";
import { commercialServices, getService } from "@/lib/services";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return commercialServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService("commercial", slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/commercial/${service.slug}` },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const service = getService("commercial", slug);
  if (!service) notFound();
  return <ServiceView service={service} />;
}
