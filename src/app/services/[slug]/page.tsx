import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceView } from "@/components/pages/ServiceView";
import { coreServices, getService } from "@/lib/services";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return coreServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService("core", slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService("core", slug);
  if (!service) notFound();
  return <ServiceView service={service} />;
}
