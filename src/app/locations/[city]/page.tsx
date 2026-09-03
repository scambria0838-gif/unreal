import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationView } from "@/components/pages/LocationView";
import { getLocation, locations } from "@/lib/locations";

type Props = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return locations.map((location) => ({ city: location.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const location = getLocation(city);
  if (!location) return {};
  return {
    title: `${location.name} construction consulting and permits`,
    description: location.character,
    alternates: { canonical: `/locations/${location.slug}` },
  };
}

export default async function Page({ params }: Props) {
  const { city } = await params;
  const location = getLocation(city);
  if (!location) notFound();
  return <LocationView location={location} />;
}
